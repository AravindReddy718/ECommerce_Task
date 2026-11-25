import CheckoutForm from "../CheckoutForm";
import {
  IconTrash,
  IconPlus,
  IconMinus,
  IconShoppingCart,
  IconTruck,
  IconShieldCheck,
  IconPackage,
  IconCheckCircle,
} from "../common/Icons";

function CartPage({
  cart,
  changeQuantity,
  cartTotal,
  token,
  handleOrderPlaced,
  lastOrder,
}) {
  const FREE_SHIPPING_THRESHOLD = 999;
  const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD;
  const amountNeededForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - cartTotal
  );
  const freeShippingProgress = Math.min(
    100,
    (cartTotal / FREE_SHIPPING_THRESHOLD) * 100
  );

  return (
    <div className="cart-page-layout">

      <div className="cart-items-section">
        <div className="cart-section-header">
          <h2>Shopping Bag</h2>
          <span className="cart-item-count-tag">
            {cart.reduce((sum, i) => sum + i.quantity, 0)} items
          </span>
        </div>

        <div className="free-shipping-card">
          <div className="shipping-text-row">
            <span className="shipping-icon-circle">
              <IconTruck size={18} />
            </span>
            <span className="shipping-promo-text">
              {isFreeShipping ? (
                <strong>Congratulations! You have qualified for FREE Express Delivery!</strong>
              ) : (
                <>
                  Add <strong>₹{amountNeededForFreeShipping.toLocaleString("en-IN")}</strong> more for <strong>FREE Delivery</strong>
                </>
              )}
            </span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${isFreeShipping ? "complete" : ""}`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart-view">
            <div className="empty-cart-icon-circle">
              <IconShoppingCart size={48} />
            </div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven’t added any items to your shopping cart yet.</p>
          </div>
        ) : (
          <div className="cart-items-list">
            {cart.map((item) => {
              const itemTotal = item.price * item.quantity;
              const isMaxStock = item.quantity >= item.stock;

              return (
                <div key={item._id} className="cart-item-card">
                  <div className="cart-item-thumbnail">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="cart-thumbnail-fallback"
                      style={{ display: item.image ? "none" : "flex" }}
                    >
                      <IconPackage size={24} />
                    </div>
                  </div>

                  <div className="cart-item-info">
                    <span className="cart-item-category">{item.category}</span>
                    <h4 className="cart-item-title">{item.name}</h4>
                    <span className="cart-item-unit-price">
                      ₹{Number(item.price).toLocaleString("en-IN")} each
                    </span>
                  </div>

                  <div className="cart-item-stepper">
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => changeQuantity(item._id, -1)}
                      aria-label="Decrease quantity"
                    >
                      {item.quantity === 1 ? <IconTrash size={15} /> : <IconMinus size={15} />}
                    </button>
                    <span className="stepper-value">{item.quantity}</span>
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => {
                        if (!isMaxStock) {
                          changeQuantity(item._id, 1);
                        }
                      }}
                      disabled={isMaxStock}
                      aria-label="Increase quantity"
                      title={isMaxStock ? "Max stock reached" : "Add one"}
                    >
                      <IconPlus size={15} />
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    <span className="subtotal-amount">
                      ₹{itemTotal.toLocaleString("en-IN")}
                    </span>
                    {isMaxStock && (
                      <span className="stock-max-hint">Max stock</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}


        <div className="cart-guarantees-grid">
          <div className="guarantee-box">
            <IconShieldCheck size={20} />
            <div>
              <strong>Secure Transactions</strong>
              <p>Bank-grade encryption & payment protection</p>
            </div>
          </div>
          <div className="guarantee-box">
            <IconTruck size={20} />
            <div>
              <strong>Fast Dispatch</strong>
              <p>Dispatched directly from verified sellers</p>
            </div>
          </div>
        </div>
      </div>


      <div className="cart-checkout-section">
        <CheckoutForm
          cart={cart}
          token={token}
          onOrderPlaced={handleOrderPlaced}
        />

        {lastOrder && (
          <div className="last-order-card animate-fade-in">
            <div className="last-order-icon">
              <IconCheckCircle size={28} />
            </div>
            <div className="last-order-details">
              <h3>Order Placed Successfully!</h3>
              <p className="last-order-id">
                Order ID: <code>{lastOrder._id}</code>
              </p>
              <div className="last-order-meta">
                <span>
                  Status: <strong>{lastOrder.status}</strong>
                </span>
                <span>
                  Total: <strong>₹{Number(lastOrder.total).toLocaleString("en-IN")}</strong>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
