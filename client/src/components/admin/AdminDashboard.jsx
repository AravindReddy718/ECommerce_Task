import { useEffect, useState } from "react";
import SellerApprovals from "./SellerApprovals";
import AdminAccounts from "./AdminAccounts";
import SellerDashboard from "../seller/SellerDashboard";
import {
  IconUsers,
  IconShield,
  IconPackage,
  IconStore,
} from "../common/Icons";

function AdminDashboard({ token, currentUserId }) {
  const [activeTab, setActiveTab] = useState("accounts");
  const [users, setUsers] = useState([]);
  const [pendingSellersCount, setPendingSellersCount] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch("http://localhost:5001/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load users");
        }

        setUsers(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, [token]);

  async function toggleAccountStatus(account) {
    setError("");
    setMessage("");

    const currentlyActive = account.isActive !== false;

    try {
      const response = await fetch(
        `http://localhost:5001/api/admin/users/${account._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !currentlyActive }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update account");
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === data.user._id ? data.user : user
        )
      );
      setMessage(data.message || "Account status updated successfully.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const totalAccounts = users.length;
  const totalSellers = users.filter((u) => u.role === "seller").length;
  const approvedSellers = users.filter((u) => u.role === "seller" && u.sellerApproved).length;
  const totalCustomers = users.filter((u) => u.role === "customer").length;

  return (
    <div className="admin-portal-container">

      <div className="admin-header-banner">
        <div>
          <h2 className="admin-portal-title">Platform Administration</h2>
          <p className="admin-portal-subtitle">
            Centralized control center for user accounts, merchant verification, and product moderation
          </p>
        </div>
      </div>

      <div className="admin-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box">
            <IconUsers size={22} />
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{totalAccounts}</span>
            <span className="kpi-label">Total Accounts</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box">
            <IconStore size={22} />
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{approvedSellers} / {totalSellers}</span>
            <span className="kpi-label">Active / Total Sellers</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box">
            <IconUsers size={22} />
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{totalCustomers}</span>
            <span className="kpi-label">Registered Shoppers</span>
          </div>
        </div>

        <div className={`kpi-card ${pendingSellersCount > 0 ? "kpi-warning" : ""}`}>
          <div className="kpi-icon-box">
            <IconShield size={22} />
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{pendingSellersCount}</span>
            <span className="kpi-label">Pending Merchant Approvals</span>
          </div>
        </div>
      </div>

      <div className="admin-segmented-tabs">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "accounts" ? "active" : ""}`}
          onClick={() => setActiveTab("accounts")}
        >
          <IconUsers size={17} />
          <span>Accounts Management ({users.length})</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "approvals" ? "active" : ""}`}
          onClick={() => setActiveTab("approvals")}
        >
          <IconStore size={17} />
          <span>Seller Approvals</span>
          {pendingSellersCount > 0 && (
            <span className="pending-pill-badge">{pendingSellersCount}</span>
          )}
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          <IconPackage size={17} />
          <span>Global Product Catalog</span>
        </button>
      </div>


      {activeTab === "accounts" && (
        <AdminAccounts
          users={users}
          error={error}
          message={message}
          isLoading={isLoading}
          currentUserId={currentUserId}
          onToggleAccountStatus={toggleAccountStatus}
        />
      )}

      {activeTab === "approvals" && (
        <SellerApprovals
          token={token}
          onApprovalChange={(count) => setPendingSellersCount(count)}
        />
      )}

      {activeTab === "products" && (
        <SellerDashboard token={token} isAdmin />
      )}
    </div>
  );
}

export default AdminDashboard;
