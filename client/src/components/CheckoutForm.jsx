import { useState } from "react";

function CheckoutForm({ cart, token, onOrderPlaced }) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadRazorpayScript() {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (paymentMethod === "COD") {
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
          throw new Error(data.message || "Could not place the COD order");
        }

        onOrderPlaced(data);
        setShippingAddress("");
        setIsSubmitting(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay Checkout. Try again.");
      }

      const createResponse = await fetch(
        "http://localhost:5001/api/orders/razorpay-order",
        {
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
        }
      );

      const orderData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(orderData.message || "Could not start checkout");
      }

      const checkout = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "My Online Shop",
        description: "Test mode purchase",
        order_id: orderData.razorpayOrderId,

        handler: async function (paymentResult) {
          try {
            const verifyResponse = await fetch(
              "http://localhost:5001/api/orders/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  appOrderId: orderData.appOrderId,
                  razorpay_order_id: paymentResult.razorpay_order_id,
                  razorpay_payment_id: paymentResult.razorpay_payment_id,
                  razorpay_signature: paymentResult.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message || "Could not verify the payment"
              );
            }

            onOrderPlaced(verifyData.order);
            setShippingAddress("");
          } catch (verificationError) {
            setError(verificationError.message);
          } finally {
            setIsSubmitting(false);
          }
        },

        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      });

      checkout.open();
    } catch (requestError) {
      setError(requestError.message);
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Checkout</h2>
      <p>
        {paymentMethod === "COD"
          ? "Cash on Delivery — pay when your order arrives."
          : "Razorpay test mode — no real payment will be collected."}
      </p>

      {error && <p role="alert">{error}</p>}

      <form onSubmit={handleSubmit}>
        <fieldset
          className="checkout-payment-options"
          disabled={isSubmitting}
        >
          <legend>Payment method</legend>

          <label className="checkout-payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="Razorpay"
              checked={paymentMethod === "Razorpay"}
              onChange={(event) => setPaymentMethod(event.target.value)}
            />
            Razorpay (test mode)
          </label>

          <label className="checkout-payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={(event) => setPaymentMethod(event.target.value)}
            />
            Cash on Delivery
          </label>
        </fieldset>

        <label htmlFor="shippingAddress">Delivery address</label>
        <textarea
          id="shippingAddress"
          value={shippingAddress}
          onChange={(event) => setShippingAddress(event.target.value)}
          required
        />

        <button type="submit" disabled={isSubmitting || cart.length === 0}>
          {isSubmitting
            ? paymentMethod === "COD"
              ? "Placing COD order..."
              : "Opening checkout..."
            : paymentMethod === "COD"
              ? "Place COD order"
              : "Pay with Razorpay"}
        </button>
      </form>
    </section>
  );
}

export default CheckoutForm;