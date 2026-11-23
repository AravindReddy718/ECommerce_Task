function SellerOrders({
  sellerOrders,
  ordersError,
  isLoadingOrders,
  orderStatusMessage,
  isUpdatingOrderStatus,
  updateItemStatus,
}) {
  return (
    <section id="seller-orders">
      <h2>Orders for my products</h2>

      {orderStatusMessage && <p>{orderStatusMessage}</p>}
      {ordersError && <p role="alert">{ordersError}</p>}
      {isLoadingOrders && <p>Loading orders...</p>}

      {!isLoadingOrders && !ordersError && sellerOrders.length === 0 && (
        <p>No orders for your products yet.</p>
      )}

      {sellerOrders.map((order) => (
        <article key={order._id}>
          <h3>Order from {order.customerName}</h3>
          <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          <p>Your portion of order: ₹{order.sellerTotal}</p>

          {order.items.map((item) => (
            <div key={`${order._id}-${item.product}`}>
              <p>
                {item.name} × {item.quantity}
              </p>
              <p>Current status: {item.status || order.status || "Pending"}</p>

              <label htmlFor={`status-${order._id}-${item.product}`}>
                Update status
              </label>
              <select
                id={`status-${order._id}-${item.product}`}
                value={item.status || order.status || "Pending"}
                onChange={(event) =>
                  updateItemStatus(
                    order._id,
                    item.product,
                    event.target.value
                  )
                }
                disabled={isUpdatingOrderStatus}
              >
                <option value="Pending" disabled>
                  Pending
                </option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          ))}
        </article>
      ))}
    </section>
  );
}

export default SellerOrders;