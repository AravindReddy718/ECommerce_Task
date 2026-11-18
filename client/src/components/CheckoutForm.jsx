import { useState } from "react";

function CheckoutForm({ cart, token, onOrderPlaced }) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress,
          items: cart.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not place the order");
      }

      onOrderPlaced(data);
      setShippingAddress("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Checkout</h2>
      <p>Demo order — no payment will be collected.</p>

      {error && <p role="alert">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="shippingAddress">Delivery address</label>
        <textarea
          id="shippingAddress"
          value={shippingAddress}
          onChange={(event) => setShippingAddress(event.target.value)}
          required
        />

        <button type="submit" disabled={isSubmitting || cart.length === 0}>
          {isSubmitting ? "Placing order..." : "Place demo order"}
        </button>
      </form>
    </section>
  );
}

export default CheckoutForm;