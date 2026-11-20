const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/users",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const users = await User.find()
        .select("name email role sellerApproved sellerRejected isActive createdAt")
        .sort({ createdAt: -1 });

      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/users/:id/status",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          message: "isActive must be true or false",
        });
      }

      if (req.params.id === req.user._id.toString() && isActive === false) {
        return res.status(400).json({
          message: "You cannot suspend your own account",
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true, runValidators: true }
      ).select("name email role sellerApproved sellerRejected isActive");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Account status updated", user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/sellers/pending",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const sellers = await User.find({
        role: "seller",
        sellerApproved: false,
        sellerRejected: { $ne: true },
      }).select("name email createdAt");

      res.json(sellers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/sellers/:id/approve",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const seller = await User.findOneAndUpdate(
        { _id: req.params.id, role: "seller" },
        { sellerApproved: true, sellerRejected: false },
        { new: true }
      ).select("name email role sellerApproved sellerRejected");

      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      res.json({ message: "Seller approved", seller });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/sellers/:id/reject",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const seller = await User.findOneAndUpdate(
        {
          _id: req.params.id,
          role: "seller",
          sellerApproved: false,
          sellerRejected: { $ne: true },
        },
        { sellerRejected: true },
        { new: true }
      ).select("name email role sellerApproved sellerRejected");

      if (!seller) {
        return res.status(404).json({
          message: "Pending seller application not found",
        });
      }

      res.json({ message: "Seller application rejected", seller });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


module.exports = router;