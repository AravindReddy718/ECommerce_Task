import { useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../config/firebase";
import {
  IconShoppingBag,
  IconUser,
  IconStore,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
  IconCheckCircle,
  IconArrowRight,
  IconArrowLeft,
  IconGoogle,
  IconKey,
} from "./common/Icons";

function getUrlResetParams() {
  if (typeof window === "undefined") return { token: "", email: "" };
  const params = new URLSearchParams(window.location.search);
  return {
    token: params.get("token") || "",
    email: params.get("email") || "",
  };
}

function AuthForm({
  onAuthSuccess,
  initialMode = "login",
  initialRole = "customer",
  onBackToLanding,
}) {
  const [resetParams] = useState(getUrlResetParams);
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") {
      const hasToken = new URLSearchParams(window.location.search).get("token");
      const isResetPath = window.location.pathname.toLowerCase().includes("reset-password");
      if (hasToken || isResetPath) return "reset-password";
    }
    return initialMode;
  });

  const [formData, setFormData] = useState(() => ({
    name: "",
    email: "",
    password: "",
    role: initialRole,
  }));

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);


  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState({ message: "", success: false });
  const [resetData, setResetData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (initialMode && initialMode !== "reset-password") {
      setMode(initialMode);
    }
  }, [initialMode]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
    setForgotStatus({ message: "", success: false });
  }

  async function handleGoogleSignIn() {
    setError("");

    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setError(
        "Firebase Google Auth is not configured. Please add your VITE_FIREBASE_* credentials in client/.env"
      );
      return;
    }

    setIsGoogleSubmitting(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await fetch("http://localhost:5001/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          role: mode === "register" ? formData.role : "customer",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Google authentication failed");
      }

      onAuthSuccess(data.user, data.token);
    } catch (googleError) {
      if (
        googleError.code === "auth/popup-closed-by-user" ||
        googleError.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      if (googleError.code === "auth/popup-blocked") {
        setError(
          "Popup was blocked by your browser. Please allow popups for this site."
        );
        return;
      }
      setError(googleError.message || "Failed to authenticate with Google");
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const action = mode === "register" ? "register" : "login";
      const requestBody =
        mode === "register"
          ? formData
          : { email: formData.email, password: formData.password };

      const response = await fetch(
        `http://localhost:5001/api/auth/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not complete authentication");
      }

      onAuthSuccess(data.user, data.token);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotPasswordSubmit(event) {
    event.preventDefault();
    setError("");
    setForgotStatus({ message: "", success: false });
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:5001/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not send password reset email");
      }

      setForgotStatus({
        message: data.message || "A password reset link has been sent to your email.",
        success: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPasswordSubmit(event) {
    event.preventDefault();
    setError("");

    if (resetData.password !== resetData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (resetData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:5001/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: resetParams.token,
            email: resetParams.email,
            newPassword: resetData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setResetSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isAuthForm = mode === "login" || mode === "register";

  return (
    <div className="auth-container">

      <div className="auth-ambient-blur-1" />
      <div className="auth-ambient-blur-2" />

      <div className="auth-card-wrapper">
        {onBackToLanding && (
          <button
            type="button"
            className="auth-back-to-landing-btn"
            onClick={onBackToLanding}
            title="Return to Home"
          >
            <IconArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
        )}


        <div className="auth-brand-header">
          <div className="auth-brand-icon">
            <IconShoppingBag size={26} />
          </div>
          <h1 className="auth-brand-name">Everyday & Co.</h1>
          <p className="auth-brand-tagline">
            Curated essentials & timeless goods for daily living
          </p>
        </div>


        {isAuthForm && (
          <>

            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                className={`auth-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => switchMode("login")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab ${mode === "register" ? "active" : ""}`}
                onClick={() => switchMode("register")}
              >
                Create Account
              </button>
            </div>


            {error && (
              <div className="alert-box alert-error auth-alert" role="alert">
                <IconAlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}


            {mode === "register" && (
              <div className="form-group" style={{ marginBottom: "18px" }}>
                <label>Choose Account Role</label>
                <div className="role-selector-grid">
                  <div
                    className={`role-option-card ${formData.role === "customer" ? "selected" : ""
                      }`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: "customer" }))
                    }
                  >
                    <div className="role-icon-box">
                      <IconUser size={20} />
                    </div>
                    <div className="role-text-box">
                      <span className="role-title">Customer</span>
                      <span className="role-desc">Browse & shop goods</span>
                    </div>
                  </div>

                  <div
                    className={`role-option-card ${formData.role === "seller" ? "selected" : ""
                      }`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: "seller" }))
                    }
                  >
                    <div className="role-icon-box">
                      <IconStore size={20} />
                    </div>
                    <div className="role-text-box">
                      <span className="role-title">Seller</span>
                      <span className="role-desc">Sell your products</span>
                    </div>
                  </div>
                </div>
              </div>
            )}


            <button
              type="button"
              className="btn-google-auth"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isGoogleSubmitting}
            >
              <IconGoogle size={20} />
              <span>
                {isGoogleSubmitting
                  ? "Connecting to Google..."
                  : mode === "login"
                    ? "Sign in with Google"
                    : `Continue with Google as ${formData.role === "seller" ? "Seller" : "Customer"
                    }`}
              </span>
            </button>


            <div className="auth-divider">
              <span>or continue with email</span>
            </div>


            <form onSubmit={handleSubmit} className="auth-form-content">
              {mode === "register" && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g. Mahesh Babu"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
              )}


              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="mahesh@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>


              <div className="form-group">
                <div className="password-label-row">
                  <label htmlFor="password">Password</label>
                  {mode === "login" ? (
                    <button
                      type="button"
                      className="btn-forgot-password-link"
                      onClick={() => {
                        setMode("forgot-password");
                        setError("");
                        if (formData.email) setForgotEmail(formData.email);
                      }}
                    >
                      Forgot password?
                    </button>
                  ) : (
                    <span className="password-hint">Min. 8 characters</span>
                  )}
                </div>
                <div className="input-with-icon">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete={
                      mode === "register" ? "new-password" : "current-password"
                    }
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="input-action-right"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </div>
              </div>


              <button
                type="submit"
                className="btn-primary auth-submit-btn"
                disabled={isSubmitting || isGoogleSubmitting}
              >
                {isSubmitting ? (
                  <span>Please wait...</span>
                ) : (
                  <>
                    <span>
                      {mode === "login" ? "Sign In to Account" : "Register Account"}
                    </span>
                    <IconArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        )}


        {mode === "forgot-password" && (
          <div className="forgot-password-view animate-fade-in">
            <div className="auth-subview-header">
              <div className="auth-subview-icon">
                <IconKey size={22} />
              </div>
              <h2 className="auth-subview-title">Reset Your Password</h2>
              <p className="auth-subview-desc">
                Enter your registered email address and we'll send you a secure
                link to reset your password.
              </p>
            </div>

            {error && (
              <div className="alert-box alert-error auth-alert" role="alert">
                <IconAlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}


            {forgotStatus.success ? (
              <div className="forgot-success-box animate-fade-in">
                <div className="forgot-success-icon">
                  <IconCheckCircle size={32} />
                </div>
                <h3 className="forgot-success-title">Check Your Inbox</h3>
                <p className="forgot-success-desc">
                  {forgotStatus.message}
                </p>
                <p className="forgot-success-hint">
                  Please check your spam or promotions folder if you don't see
                  the email within a few minutes.
                </p>
                <button
                  type="button"
                  className="btn-primary auth-submit-btn"
                  onClick={() => switchMode("login")}
                >
                  <IconArrowLeft size={16} />
                  <span>Return to Sign In</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="auth-form-content">
                <div className="form-group">
                  <label htmlFor="forgot-email">Email Address</label>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary auth-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>Sending email...</span>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <IconArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="auth-switch-prompt text-center">
                  <button
                    type="button"
                    className="auth-link-button"
                    onClick={() => switchMode("login")}
                  >
                    <IconArrowLeft size={14} />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {mode === "reset-password" && (
          <div className="reset-password-view animate-fade-in">
            <div className="auth-subview-header">
              <div className="auth-subview-icon">
                <IconKey size={22} />
              </div>
              <h2 className="auth-subview-title">Choose New Password</h2>
              <p className="auth-subview-desc">
                {resetParams.email
                  ? `Enter a new password for ${resetParams.email}`
                  : "Enter your new password below."}
              </p>
            </div>

            {error && (
              <div className="alert-box alert-error auth-alert" role="alert">
                <IconAlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {resetSuccess ? (
              <div className="forgot-success-box animate-fade-in">
                <div className="forgot-success-icon">
                  <IconCheckCircle size={32} />
                </div>
                <h3 className="forgot-success-title">Password Reset Complete!</h3>
                <p className="forgot-success-desc">
                  Your password has been successfully updated. You can now sign
                  in with your new credentials.
                </p>
                <button
                  type="button"
                  className="btn-primary auth-submit-btn"
                  onClick={() => switchMode("login")}
                >
                  <span>Sign In Now</span>
                  <IconArrowRight size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="auth-form-content">
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <div className="input-with-icon">
                    <input
                      id="new-password"
                      type={showResetPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={resetData.password}
                      onChange={(e) =>
                        setResetData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className="input-action-right"
                      onClick={() => setShowResetPassword((prev) => !prev)}
                    >
                      {showResetPassword ? (
                        <IconEyeOff size={18} />
                      ) : (
                        <IconEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <input
                    id="confirm-password"
                    type={showResetPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={resetData.confirmPassword}
                    onChange={(e) =>
                      setResetData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    minLength={8}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary auth-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>Updating password...</span>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <IconArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="auth-switch-prompt text-center">
                  <button
                    type="button"
                    className="auth-link-button"
                    onClick={() => switchMode("login")}
                  >
                    <IconArrowLeft size={14} />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthForm;
