function AdminAccounts({
  users,
  error,
  message,
  isLoading,
  currentUserId,
  onToggleAccountStatus,
}) {
  return (
    <section id="admin-accounts">
      <h2>Admin dashboard</h2>

      <h3>Accounts</h3>
      {error && <p role="alert">{error}</p>}
      {message && <p>{message}</p>}
      {isLoading && <p>Loading accounts...</p>}

      {!isLoading && users.length === 0 && <p>No accounts found.</p>}

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
                      onClick={() => onToggleAccountStatus(account)}
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
  );
}

export default AdminAccounts;