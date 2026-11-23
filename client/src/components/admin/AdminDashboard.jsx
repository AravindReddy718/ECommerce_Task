import { useEffect, useState } from "react";
import SellerApprovals from "./SellerApprovals";
import AdminAccounts from "./AdminAccounts";
import SellerDashboard from "../seller/SellerDashboard";

function AdminDashboard({ token, currentUserId }) {
  const [users, setUsers] = useState([]);
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
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav" aria-label="Admin dashboard">
        <a href="#admin-accounts">Accounts</a>
        <a href="#admin-seller-approvals">Seller Approvals</a>
        <a href="#admin-products">Products</a>
      </nav>
      <AdminAccounts
        users={users}
        error={error}
        message={message}
        isLoading={isLoading}
        currentUserId={currentUserId}
        onToggleAccountStatus={toggleAccountStatus}
      />

      <SellerApprovals token={token} />
      <SellerDashboard token={token} isAdmin />
    </div>
  );
}

export default AdminDashboard;