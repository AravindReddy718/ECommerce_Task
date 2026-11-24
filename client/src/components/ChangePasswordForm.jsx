import { useState } from "react";
import {
  IconKey,
  IconEye,
  IconEyeOff,
  IconCheckCircle,
  IconAlertCircle,
} from "./common/Icons";

function ChangePasswordForm({ token, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password confirmation does not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "http://localhost:5001/api/auth/change-password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update password");
      }

      setMessage(data.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="change-password-modal-content">
      {error && (
        <div className="alert-box alert-error" role="alert">
          <IconAlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="alert-box alert-success" role="status">
          <IconCheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <div className="input-with-icon">
            <input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="input-action-right"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              aria-label="Toggle password visibility"
            >
              {showCurrentPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <div className="input-with-icon">
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              className="input-action-right"
              onClick={() => setShowNewPassword((prev) => !prev)}
              aria-label="Toggle password visibility"
            >
              {showNewPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            <IconKey size={16} />
            <span>{isSubmitting ? "Updating..." : "Update Password"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChangePasswordForm;
