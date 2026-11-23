import CheckoutForm from "../CheckoutForm";

function CartPage({
  cart,
  changeQuantity,
  cartTotal,
  token,
  handleOrderPlaced,
  lastOrder,
}) {
  return (
    <div className="cart-page">
      <section className="cart-items-panel">
        <h2>Cart</h2>

        {cart.length === 0 && <p>Your cart is empty.</p>}

        {cart.map((item) => (
          <article key={item._id} className="cart-item">
            <p>
              {item.name} — ₹{item.price} each
            </p>

            <button onClick={() => changeQuantity(item._id, -1)}>
              Remove one
            </button>

            <span> Quantity: {item.quantity} </span>

            <button
              onClick={() => {
                if (item.quantity < item.stock) {
                  changeQuantity(item._id, 1);
                }
              }}
              disabled={item.quantity >= item.stock}
            >
              Add one
            </button>
          </article>
        ))}

        <p className="cart-total">Total: ₹{cartTotal}</p>
      </section>

      <div className="cart-checkout-column">
        <CheckoutForm
          cart={cart}
          token={token}
          onOrderPlaced={handleOrderPlaced}
        />

        {lastOrder && (
          <section className="last-order-panel">
            <h2>Order placed</h2>
            <p>Order ID: {lastOrder._id}</p>
            <p>Status: {lastOrder.status}</p>
            <p>Total: ₹{lastOrder.total}</p>
          </section>
        )}
      </div>
    </div>
  );
}

export default CartPage;