import {
  IconPackage,
  IconCheckCircle,
  IconAlertCircle,
} from "../common/Icons";

function SellerOrders({
  sellerOrders,
  ordersError,
  isLoadingOrders,
  orderStatusMessage,
  isUpdatingOrderStatus,
  updateItemStatus,
}) {
  return (
    <div className="seller-orders-container" id="seller-orders">
      <div className="orders-header-row">
        <div>
          <h3>Orders for My Products</h3>
          <p className="orders-subtitle">
            Manage fulfillment, packing, and dispatch for customer purchases
          </p>
        </div>
      </div>

      {orderStatusMessage && (
        <div className="alert-box alert-success" role="status">
          <IconCheckCircle size={18} />
          <span>{orderStatusMessage}</span>
        </div>
      )}

      {ordersError && (
        <div className="alert-box alert-error" role="alert">
          <IconAlertCircle size={18} />
          <span>{ordersError}</span>
        </div>
      )}

      {isLoadingOrders && (
        <div className="catalog-loading-state">
          <div className="spinner-ring" />
          <p>Loading incoming orders...</p>
        </div>
      )}

      {!isLoadingOrders && !ordersError && sellerOrders.length === 0 && (
        <div className="catalog-empty-state">
          <div className="empty-icon-circle">
            <IconPackage size={44} />
          </div>
          <h3>No orders received yet</h3>
          <p>When customers purchase your listed items, they will appear here ready for fulfillment.</p>
        </div>
      )}

      <div className="seller-orders-list">
        {sellerOrders.map((order) => {
          const isCancelled = order.status === "Cancelled";

          return (
            <article
              className={`seller-order-card ${isCancelled ? "order-card-cancelled" : ""}`}
              key={order._id}
            >
              <div className="seller-order-header">
                <div className="order-customer-info">
                  <span className="customer-avatar-badge">
                    {order.customerName ? order.customerName.charAt(0).toUpperCase() : "C"}
                  </span>
                  <div>
                    <h4 className="customer-name">{order.customerName}</h4>
                    <span className="order-placed-date">
                      Ordered on {new Date(order.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="order-seller-header-right">
                  {isCancelled && (
                    <span className="status-badge status-cancelled">
                      Order Cancelled
                    </span>
                  )}

                  <div className="order-seller-payout-box">
                    <span className="payout-label">Your Order Share:</span>
                    <span
                      className={`payout-amount ${isCancelled ? "payout-cancelled" : ""}`}
                    >
                      ₹{Number(order.sellerTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="seller-order-destination">
                <span className="dest-label">Delivery Address:</span>
                <span className="dest-value">{order.shippingAddress}</span>
              </div>

              <div className="seller-order-items-wrapper">
                <span className="items-heading">Items to Fulfill ({order.items.length})</span>
                <div className="seller-items-table">
                  {order.items.map((item) => (
                    <div
                      key={`${order._id}-${item.product}`}
                      className="seller-item-fulfillment-row"
                    >
                      <div className="item-details-left">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">Qty: {item.quantity}</span>
                        <span className="item-subprice">
                          Total: ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="item-fulfillment-actions">
                        <div className="status-current-badge">
                          <span
                            className={`status-badge status-${(
                              item.status ||
                              order.status ||
                              "pending"
                            ).toLowerCase()}`}
                          >
                            {item.status || order.status || "Pending"}
                          </span>
                        </div>

                        <div className="status-update-control">
                          <label
                            htmlFor={`status-${order._id}-${item.product}`}
                            className="status-control-label"
                          >
                            Update Status:
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
                            disabled={isUpdatingOrderStatus || isCancelled}
                            title={
                              isCancelled
                                ? "Cannot change status of a cancelled order"
                                : "Update status"
                            }
                            className="status-select-dropdown"
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default SellerOrders;
