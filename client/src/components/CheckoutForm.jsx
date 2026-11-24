import { useState } from "react";
import {
  IconCreditCard,
  IconTruck,
  IconShieldCheck,
  IconAlertCircle,
  IconArrowRight,
} from "./common/Icons";

function CheckoutForm({ cart, token, onOrderPlaced }) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = cartTotal >= 999 || cartTotal === 0 ? 0 : 79;
  const grandTotal = cartTotal + shippingFee;

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

    if (!shippingAddress.trim()) {
      setError("Please provide a complete delivery address.");
      return;
    }

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

      // Razorpay payment flow
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay Checkout gateway. Please try again.");
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
        name: "Everyday & Co.",
        description: "Official purchase checkout",
        order_id: orderData.razorpayOrderId,
        theme: {
          color: "#c25e1a",
        },

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
                verifyData.message || "Could not verify the payment transaction"
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
    <div className="checkout-card">
      <div className="checkout-header">
        <h3>Order Summary</h3>
        <span className="checkout-secure-badge">
          <IconShieldCheck size={14} />
          <span>Encrypted Checkout</span>
        </span>
      </div>

      {/* Pricing Breakdown */}
      <div className="checkout-pricing-summary">
        <div className="price-row">
          <span>Items Subtotal</span>
          <span>₹{cartTotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="price-row">
          <span>Estimated Shipping</span>
          <span>{shippingFee === 0 ? <strong className="text-free">FREE</strong> : `₹${shippingFee}`}</span>
        </div>
        <div className="price-row price-row-total">
          <span>Order Total</span>
          <span className="total-grand-price">₹{grandTotal.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error" role="alert">
          <IconAlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="checkout-form">
        {/* Payment Method Selector */}
        <div className="form-group">
          <label>Select Payment Method</label>
          <div className="payment-method-selector-grid">
            <div
              className={`payment-option-card ${
                paymentMethod === "Razorpay" ? "selected" : ""
              }`}
              onClick={() => setPaymentMethod("Razorpay")}
            >
              <div className="payment-option-header">
                <div className="payment-icon-box">
                  <IconCreditCard size={18} />
                </div>
                <div className="payment-radio-circle">
                  {paymentMethod === "Razorpay" && <div className="radio-dot" />}
                </div>
              </div>
              <span className="payment-method-title">Cards, UPI & NetBanking</span>
              <span className="payment-method-desc">Razorpay Sandbox Gateway</span>
            </div>

            <div
              className={`payment-option-card ${
                paymentMethod === "COD" ? "selected" : ""
              }`}
              onClick={() => setPaymentMethod("COD")}
            >
              <div className="payment-option-header">
                <div className="payment-icon-box">
                  <IconTruck size={18} />
                </div>
                <div className="payment-radio-circle">
                  {paymentMethod === "COD" && <div className="radio-dot" />}
                </div>
              </div>
              <span className="payment-method-title">Cash on Delivery</span>
              <span className="payment-method-desc">Pay at your doorstep</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="form-group">
          <label htmlFor="shippingAddress">Delivery Address</label>
          <textarea
            id="shippingAddress"
            placeholder="Flat/House No., Street, Landmark, City, State, PIN code"
            value={shippingAddress}
            onChange={(event) => setShippingAddress(event.target.value)}
            disabled={isSubmitting || cart.length === 0}
            required
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="btn-primary checkout-submit-btn"
          disabled={isSubmitting || cart.length === 0}
        >
          {isSubmitting ? (
            <span>Processing Order...</span>
          ) : (
            <>
              <span>
                {paymentMethod === "COD"
                  ? `Place COD Order (₹${grandTotal.toLocaleString("en-IN")})`
                  : `Pay with Razorpay (₹${grandTotal.toLocaleString("en-IN")})`}
              </span>
              <IconArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default CheckoutForm;
