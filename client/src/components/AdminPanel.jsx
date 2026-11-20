import { useEffect, useState } from "react";

function AdminPanel({ token }) {
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

      setSellers((currentSellers) =>
        currentSellers.filter((seller) => seller._id !== sellerId)
      );
      setMessage(`${data.seller.name} is approved.`);
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
        throw new Error(data.message || "Could not reject seller");
      }

      setSellers((currentSellers) =>
        currentSellers.filter((seller) => seller._id !== sellerId)
      );
      setMessage(`${data.seller.name}'s application was rejected.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRejectingId("");
    }
  }
  return (
    <section>
      <h2>Seller approvals</h2>

      {error && <p role="alert">{error}</p>}
      {message && <p>{message}</p>}
      {isLoading && <p>Loading pending sellers...</p>}

      {!isLoading && sellers.length === 0 && !error && (
        <p>There are no sellers waiting for approval.</p>
      )}

      {sellers.map((seller) => (
        <article key={seller._id}>
          <h3>{seller.name}</h3>
          <p>{seller.email}</p>
          <button
            onClick={() => approveSeller(seller._id)}
            disabled={approvingId === seller._id || rejectingId === seller._id}
          >
            {approvingId === seller._id ? "Approving..." : "Approve"}
          </button>
          <button
            onClick={() => rejectSeller(seller._id)}
            disabled={approvingId === seller._id || rejectingId === seller._id}
          >
            {rejectingId === seller._id ? "Rejecting..." : "Reject"}
          </button>

        </article>
      ))}
    </section>
  );
}

export default AdminPanel;