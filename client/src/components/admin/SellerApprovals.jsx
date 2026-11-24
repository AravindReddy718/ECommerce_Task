import { useEffect, useState } from "react";
import {
  IconCheck,
  IconX,
  IconCheckCircle,
  IconAlertCircle,
  IconStore,
} from "../common/Icons";

function SellerApprovals({ token, onApprovalChange }) {
  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState("");
  const [rejectingId, setRejectingId] = useState("");

  useEffect(() => {
    async function loadPendingSellers() {
      setError("");

      try {
        const response = await fetch(
          "http://localhost:5001/api/admin/sellers/pending",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load sellers");
        }

        setSellers(data);
        onApprovalChange?.(data.length);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadPendingSellers();
  }, [token]);

  async function approveSeller(sellerId) {
    setError("");
    setMessage("");
    setApprovingId(sellerId);

    try {
      const response = await fetch(
        `http://localhost:5001/api/admin/sellers/${sellerId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not approve seller");
      }

      setSellers((prev) => {
        const updated = prev.filter((s) => s._id !== sellerId);
        onApprovalChange?.(updated.length);
        return updated;
      });
      setMessage(`${data.seller.name} is now approved to sell products.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setApprovingId("");
    }
  }

  async function rejectSeller(sellerId) {
    setError("");
    setMessage("");
    setRejectingId(sellerId);

    try {
      const response = await fetch(
        `http://localhost:5001/api/admin/sellers/${sellerId}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not reject seller application");
      }

      setSellers((prev) => {
        const updated = prev.filter((s) => s._id !== sellerId);
        onApprovalChange?.(updated.length);
        return updated;
      });
      setMessage(`${data.seller.name}'s merchant application was rejected.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRejectingId("");
    }
  }

  return (
    <div className="seller-approvals-container" id="admin-seller-approvals">
      <div className="approvals-header">
        <div>
          <h3>Pending Merchant Applications</h3>
          <p className="admin-subtitle">
            Review new merchant requests before granting catalog listing rights
          </p>
        </div>
        <span className="pending-badge-counter">
          {sellers.length} Pending Approval
        </span>
      </div>

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

      {isLoading && (
        <div className="catalog-loading-state">
          <div className="spinner-ring" />
          <p>Checking pending merchant queue...</p>
        </div>
      )}

      {!isLoading && sellers.length === 0 && !error && (
        <div className="catalog-empty-state">
          <div className="empty-icon-circle">
            <IconStore size={44} />
          </div>
          <h3>All caught up!</h3>
          <p>There are currently no seller applications awaiting admin review.</p>
        </div>
      )}

      <div className="approvals-grid">
        {sellers.map((seller) => (
          <article className="seller-approval-card" key={seller._id}>
            <div className="approval-card-avatar">
              <IconStore size={26} />
            </div>

            <div className="approval-card-content">
              <h4 className="approval-seller-name">{seller.name}</h4>
              <p className="approval-seller-email">{seller.email}</p>
              <span className="approval-date">
                Applied on {new Date(seller.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="approval-actions-col">
              <button
                type="button"
                className="btn-primary approval-btn-approve"
                onClick={() => approveSeller(seller._id)}
                disabled={approvingId === seller._id || rejectingId === seller._id}
              >
                <IconCheck size={16} />
                <span>{approvingId === seller._id ? "Approving..." : "Approve"}</span>
              </button>

              <button
                type="button"
                className="btn-secondary approval-btn-reject"
                onClick={() => rejectSeller(seller._id)}
                disabled={approvingId === seller._id || rejectingId === seller._id}
              >
                <IconX size={16} />
                <span>{rejectingId === seller._id ? "Rejecting..." : "Reject"}</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default SellerApprovals;
