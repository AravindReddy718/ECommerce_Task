import { useState, useMemo } from "react";
import {
  IconSearch,
  IconCheckCircle,
  IconAlertCircle,
} from "../common/Icons";

function AdminAccounts({
  users,
  error,
  message,
  isLoading,
  currentUserId,
  onToggleAccountStatus,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <div className="admin-accounts-section" id="admin-accounts">
      <div className="admin-section-header-row">
        <div>
          <h3>System User Accounts</h3>
          <p className="admin-subtitle">
            Audit registered identities, assign platform privileges, and moderate access
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="admin-table-toolbar">
          <div className="input-with-icon" style={{ minWidth: "220px" }}>
            <span className="input-icon-left">
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Filter by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="admin-role-select"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
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
          <p>Loading user accounts directory...</p>
        </div>
      )}

      {!isLoading && users.length === 0 && (
        <div className="catalog-empty-state">
          <p>No user accounts recorded in the database.</p>
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Seller Status</th>
                <th>Account Status</th>
                <th style={{ textAlign: "right" }}>Moderation</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((account) => {
                const isActive = account.isActive !== false;
                const isCurrent = account._id === currentUserId;

                return (
                  <tr key={account._id}>
                    <td>
                      <div className="table-user-cell">
                        <div className="table-user-avatar">
                          {account.name ? account.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="table-user-info">
                          <span className="table-user-name">
                            {account.name} {isCurrent && <span className="you-pill">You</span>}
                          </span>
                          <span className="table-user-email">{account.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`user-role-pill badge-${account.role}`}>
                        {account.role}
                      </span>
                    </td>

                    <td>
                      {account.role === "seller" ? (
                        <span
                          className={`status-badge ${
                            account.sellerApproved
                              ? "status-delivered"
                              : account.sellerRejected
                              ? "status-cancelled"
                              : "status-pending"
                          }`}
                        >
                          {account.sellerApproved
                            ? "Approved"
                            : account.sellerRejected
                            ? "Rejected"
                            : "Pending Approval"}
                        </span>
                      ) : (
                        <span className="cell-muted">—</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          isActive ? "status-delivered" : "status-cancelled"
                        }`}
                      >
                        <span
                          className={`status-dot ${isActive ? "active" : "inactive"}`}
                        />
                        {isActive ? "Active" : "Suspended"}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className={isActive ? "btn-ghost item-action-btn-danger" : "btn-secondary"}
                        onClick={() => onToggleAccountStatus(account)}
                        disabled={isCurrent}
                        title={
                          isCurrent
                            ? "Cannot suspend your own account"
                            : isActive
                            ? "Suspend Account"
                            : "Reactivate Account"
                        }
                      >
                        {isCurrent
                          ? "Self"
                          : isActive
                          ? "Suspend"
                          : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminAccounts;
