const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const { verifyFirebaseToken } = require("../config/firebase");
const { sendEmail, buildPasswordResetEmail } = require("../utils/sendEmail");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters",
      });
    }

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const selectedRole = role || "customer";

    if (!["customer", "seller"].includes(selectedRole)) {
      return res.status(400).json({
        message: "Invalid registration role",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: cleanName,
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: "local",
      role: selectedRole,
    });

    res.status(201).json({
      message:
        user.role === "seller"
          ? "Registration received. Seller account is awaiting approval."
          : "Registration successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerApproved: user.sellerApproved,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.password && user.authProvider === "google") {
      return res.status(400).json({
        message: "This account was registered with Google. Please use Google Sign In.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "This account has been suspended" });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message:
        user.role === "seller" && !user.sellerApproved
          ? "Login successful. Your seller account is awaiting approval."
          : "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerApproved: user.sellerApproved,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { idToken, role } = req.body || {};

    if (!idToken) {
      return res.status(400).json({ message: "Firebase ID token is required" });
    }

    let decodedToken;
    try {
      decodedToken = await verifyFirebaseToken(idToken);
    } catch (verifyError) {
      return res.status(401).json({
        message: verifyError.message || "Invalid or unverified Firebase ID token",
      });
    }

    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({
        message: "Google account does not have an associated email address",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({
      $or: [{ email: normalizedEmail }, { googleId: uid }],
    });

    if (user) {
      if (user.isActive === false) {
        return res.status(403).json({ message: "This account has been suspended" });
      }

      let needsSave = false;
      if (!user.googleId) {
        user.googleId = uid;
        needsSave = true;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }

      const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        message:
          user.role === "seller" && !user.sellerApproved
            ? "Sign in successful. Your seller account is awaiting approval."
            : "Sign in successful.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          sellerApproved: user.sellerApproved,
          avatar: user.avatar || picture || "",
        },
      });
    }

    // New user signup via Google
    const selectedRole = role === "seller" ? "seller" : "customer";
    const displayName =
      (typeof name === "string" && name.trim()) || normalizedEmail.split("@")[0];

    user = await User.create({
      name: displayName,
      email: normalizedEmail,
      authProvider: "google",
      googleId: uid,
      avatar: picture || "",
      role: selectedRole,
      sellerApproved: selectedRole === "seller" ? false : true,
    });

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message:
        user.role === "seller"
          ? "Registration received. Seller account is awaiting approval."
          : "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerApproved: user.sellerApproved,
        avatar: user.avatar || picture || "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Google authentication failed" });
  }
});

router.patch("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (!user.password && user.authProvider === "google") {
      return res.status(400).json({
        message:
          "Accounts registered with Google do not have a password. Please continue signing in with Google.",
      });
    }

    if (
      typeof currentPassword !== "string" ||
      !currentPassword ||
      typeof newPassword !== "string" ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        message: "Choose a new password different from your current one",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Could not update password. Please try again.",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Please enter your email address" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address",
      });
    }

    if (!user.password && user.authProvider === "google") {
      return res.status(400).json({
        message:
          "This account is registered using Google Sign-In. Please sign in with Google directly.",
      });
    }

    // Generate random reset token & secure SHA256 hash
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 1 hour
    user.passwordResetTokenHash = resetTokenHash;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    // Always log the reset link prominently in the terminal for easy development access
    console.log("\n============================================================");
    console.log("🔐 PASSWORD RESET REQUESTED");
    console.log(`👤 User:  ${user.name} (${user.email})`);
    console.log(`🔗 Link:  ${resetUrl}`);
    console.log("============================================================\n");

    const { html, text } = buildPasswordResetEmail({
      name: user.name,
      resetUrl,
    });

    await sendEmail({
      to: user.email,
      subject: "Reset your Everyday & Co. password",
      text,
      html,
    });

    return res.json({
      message: "A password reset link has been sent to your email address.",
    });
  } catch (error) {
    console.error("[ForgotPassword Error]", error);
    return res.status(500).json({
      message: error.message || "Failed to process password reset request",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, email, newPassword } = req.body || {};

    if (!token || !email || !newPassword) {
      return res.status(400).json({
        message: "Token, email, and new password are required",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      email: normalizedEmail,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetTokenHash +passwordResetExpires");

    if (!user || user.passwordResetTokenHash !== tokenHash) {
      return res.status(400).json({
        message: "Password reset link is invalid or has expired",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.json({
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("[ResetPassword Error]", error);
    return res.status(500).json({
      message: error.message || "Failed to reset password",
    });
  }
});

module.exports = router;
