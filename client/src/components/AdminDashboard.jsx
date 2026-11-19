import { useEffect, useState } from "react";
import AdminPanel from "./AdminPanel";
import SellerDashboard from "./SellerDashboard";

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
    <div>
      <section>
        <h2>Admin dashboard</h2>

        <h3>Accounts</h3>
        {error && <p role="alert">{error}</p>}
        {message && <p>{message}</p>}
        {isLoading && <p>Loading accounts...</p>}

        {!isLoading && users.length === 0 && (
          <p>No accounts found.</p>
        )}

        {!isLoading && users.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Seller status</th>
                <th>Account status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((account) => {
                const isActive = account.isActive !== false;

                return (
                  <tr key={account._id}>
                    <td>{account.name}</td>
                    <td>{account.email}</td>
                    <td>{account.role}</td>
                    <td>
                      {account.role === "seller"
                        ? account.sellerApproved
                          ? "Approved"
                          : "Pending"
                        : "—"}
                    </td>
                    <td>{isActive ? "Active" : "Suspended"}</td>
                    <td>
                      <button
                        onClick={() => toggleAccountStatus(account)}
                        disabled={account._id === currentUserId}
                        >
                        {account._id === currentUserId
                            ? "Current account"
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
        )}
      </section>

      <AdminPanel token={token} />
      <SellerDashboard token={token} isAdmin />
    </div>
  );
}

export default AdminDashboard;