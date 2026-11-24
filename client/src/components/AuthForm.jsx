import { useState } from "react";
import {
  IconShoppingBag,
  IconUser,
  IconStore,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
  IconArrowRight,
} from "./common/Icons";

function AuthForm({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
  }

  return (
    <div className="auth-container">
      {/* Visual Ambient Blur Accents */}
      <div className="auth-ambient-blur-1" />
      <div className="auth-ambient-blur-2" />

      <div className="auth-card-wrapper">
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-icon">
            <IconShoppingBag size={26} />
          </div>
          <h1 className="auth-brand-name">Everyday & Co.</h1>
          <p className="auth-brand-tagline">
            Curated essentials & timeless goods for daily living
          </p>
        </div>

        {/* Mode Selector Tabs */}
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

        {/* Error Alert */}
        {error && (
          <div className="alert-box alert-error auth-alert" role="alert">
            <IconAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form-content">
          {mode === "register" && (
            <>
              {/* Account Type Card Picker */}
              <div className="form-group">
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

              {/* Name Input */}
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
            </>
          )}

          {/* Email Input */}
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

          {/* Password Input with Visibility Toggle */}
          <div className="form-group">
            <div className="password-label-row">
              <label htmlFor="password">Password</label>
              {mode === "login" && (
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

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={isSubmitting}
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


      </div>
    </div>
  );
}

export default AuthForm;
