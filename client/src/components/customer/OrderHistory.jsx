function OrderHistory({
  orders,
  orderHistoryError,
  orderHistoryMessage,
  isLoadingOrders,
  onCancelOrder,
  cancelingOrderId,
}) {
  return (
    <section className="order-history">
      <h2>My orders</h2>

      {orderHistoryError && <p role="alert">{orderHistoryError}</p>}
      {orderHistoryMessage && <p>{orderHistoryMessage}</p>}
      {isLoadingOrders && <p>Loading order history...</p>}

      {!isLoadingOrders && orders.length === 0 && !orderHistoryError && (
        <p>You haven’t placed any orders yet.</p>
      )}

      {orders.map((order) => {
        
        const hasShippedItem = order.items.some((item) =>
          ["Shipped", "Delivered"].includes(item.status)
        );
        const canCancel =
          order.paymentMethod === "COD" &&
          order.paymentStatus === "Pending" &&
          order.status !== "Cancelled" &&
          !["Shipped", "Delivered"].includes(order.status) &&
          !order.items.some((item) =>
            ["Shipped", "Delivered"].includes(item.status)
          );

        return (
          <article className="order-card" key={order._id}>
            <h3>Order {order._id}</h3>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>

            <p className={`status-pill status-${order.status.toLowerCase()}`}>
              Status: {order.status}
            </p>

            <p
              className={`status-pill payment-${(
                order.paymentStatus || "unknown"
              ).toLowerCase()}`}
            >
              Payment status: {order.paymentStatus || "Not recorded"}
            </p>
            <p>
              Payment method:{" "}
              {order.paymentMethod === "COD"
                ? "Cash on Delivery"
                : order.paymentMethod || "Not recorded"}
            </p>

            <p>Total: ₹{order.total}</p>
            <p>Delivery address: {order.shippingAddress}</p>

            {order.items.map((item) => (
              <div key={`${order._id}-${item.product}`}>
                <p>
                  {item.name} × {item.quantity}
                </p>
                <p
                  className={`status-pill status-${(
                    item.status ||
                    order.status ||
                    "Pending"
                  ).toLowerCase()}`}
                >
                  Item status: {item.status || order.status || "Pending"}
                </p>
              </div>
            ))}

            {canCancel && (
              <button
                className="cancel-order-button"
                onClick={() => onCancelOrder(order._id)}
                disabled={cancelingOrderId === order._id}
              >
                {cancelingOrderId === order._id
                  ? "Cancelling..."
                  : "Cancel order"}
              </button>
            )}
          </article>
        );
      })}
    </section>
  );
}

export default OrderHistory;