import { useState } from "react";
import {
  IconPackage,
  IconCheck,
  IconTruck,
  IconCheckCircle,
  IconAlertCircle,
} from "../common/Icons";

function OrderHistory({
  orders,
  orderHistoryError,
  orderHistoryMessage,
  isLoadingOrders,
  onCancelOrder,
  cancelingOrderId,
}) {
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active") return ["Pending", "Confirmed", "Shipped"].includes(order.status);
    if (filterStatus === "delivered") return order.status === "Delivered";
    if (filterStatus === "cancelled") return order.status === "Cancelled";
    return true;
  });

  function getStepIndex(status) {
    if (status === "Cancelled") return -1;
    if (status === "Pending") return 0;
    if (status === "Confirmed") return 1;
    if (status === "Shipped") return 2;
    if (status === "Delivered") return 3;
    return 0;
  }

  return (
    <div className="order-history-container">
      <div className="orders-header-row">
        <div>
          <h2>Order History & Tracking</h2>
          <p className="orders-subtitle">Track, manage, and review your previous purchases</p>
        </div>

        {/* Filter Tabs */}
        <div className="order-filter-pills">
          <button
            type="button"
            className={`filter-pill ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All Orders ({orders.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterStatus === "active" ? "active" : ""}`}
            onClick={() => setFilterStatus("active")}
          >
            In Transit ({orders.filter((o) => ["Pending", "Confirmed", "Shipped"].includes(o.status)).length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterStatus === "delivered" ? "active" : ""}`}
            onClick={() => setFilterStatus("delivered")}
          >
            Delivered ({orders.filter((o) => o.status === "Delivered").length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterStatus === "cancelled" ? "active" : ""}`}
            onClick={() => setFilterStatus("cancelled")}
          >
            Cancelled ({orders.filter((o) => o.status === "Cancelled").length})
          </button>
        </div>
      </div>

      {orderHistoryError && (
        <div className="alert-box alert-error" role="alert">
          <IconAlertCircle size={18} />
          <span>{orderHistoryError}</span>
        </div>
      )}

      {orderHistoryMessage && (
        <div className="alert-box alert-success" role="status">
          <IconCheckCircle size={18} />
          <span>{orderHistoryMessage}</span>
        </div>
      )}

      {isLoadingOrders && (
        <div className="catalog-loading-state">
          <div className="spinner-ring" />
          <p>Retrieving your order records...</p>
        </div>
      )}

      {!isLoadingOrders && orders.length === 0 && !orderHistoryError && (
        <div className="catalog-empty-state">
          <div className="empty-icon-circle">
            <IconPackage size={44} />
          </div>
          <h3>You haven't placed any orders yet</h3>
          <p>Once you purchase items from our catalog, track their dispatch and delivery status live right here.</p>
        </div>
      )}

      {!isLoadingOrders && orders.length > 0 && filteredOrders.length === 0 && (
        <div className="catalog-empty-state">
          <h3>No orders match this filter</h3>
          <p>Try switching to "All Orders" to view your full order history.</p>
        </div>
      )}

      <div className="orders-cards-list">
        {filteredOrders.map((order) => {
          const stepIndex = getStepIndex(order.status);
          const isCancelled = order.status === "Cancelled";

          const canCancel =
            order.paymentMethod === "COD" &&
            order.paymentStatus === "Pending" &&
            order.status !== "Cancelled" &&
            !["Shipped", "Delivered"].includes(order.status) &&
            !order.items.some((item) =>
              ["Shipped", "Delivered"].includes(item.status)
            );

          return (
            <article className="order-tracking-card" key={order._id}>
              {/* Order Card Top Bar */}
              <div className="order-card-header">
                <div className="order-meta-info">
                  <div className="order-id-group">
                    <span className="order-id-label">Order</span>
                    <span className="order-id-hash">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                  </div>
                  <span className="order-date-text">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="order-status-badges">
                  <span
                    className={`status-badge status-${order.status.toLowerCase()}`}
                  >
                    {order.status}
                  </span>

                  <span
                    className={`status-badge payment-${(
                      order.paymentStatus || "unknown"
                    ).toLowerCase()}`}
                  >
                    Payment: {order.paymentStatus || "Pending"}
                  </span>
                </div>
              </div>

              {/* Visual Order Progress Stepper */}
              {!isCancelled ? (
                <div className="order-stepper-wrapper">
                  <div className="stepper-line">
                    <div
                      className="stepper-progress-fill"
                      style={{
                        width:
                          stepIndex === 0
                            ? "15%"
                            : stepIndex === 1
                            ? "45%"
                            : stepIndex === 2
                            ? "75%"
                            : "100%",
                      }}
                    />
                  </div>
                  <div className="stepper-steps">
                    <div className={`step-node ${stepIndex >= 0 ? "completed" : ""}`}>
                      <div className="node-circle">
                        <IconCheck size={12} />
                      </div>
                      <span className="node-label">Placed</span>
                    </div>

                    <div className={`step-node ${stepIndex >= 1 ? "completed" : ""}`}>
                      <div className="node-circle">
                        <IconCheck size={12} />
                      </div>
                      <span className="node-label">Confirmed</span>
                    </div>

                    <div className={`step-node ${stepIndex >= 2 ? "completed" : ""}`}>
                      <div className="node-circle">
                        <IconTruck size={14} />
                      </div>
                      <span className="node-label">Shipped</span>
                    </div>

                    <div className={`step-node ${stepIndex >= 3 ? "completed" : ""}`}>
                      <div className="node-circle">
                        <IconCheckCircle size={14} />
                      </div>
                      <span className="node-label">Delivered</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="order-cancelled-notice">
                  <IconAlertCircle size={18} />
                  <span>This order was cancelled. Items have been restocked.</span>
                </div>
              )}

              {/* Order Items Table / List */}
              <div className="order-items-breakdown">
                <span className="section-small-title">Purchased Items ({order.items.length})</span>
                <div className="order-items-grid">
                  {order.items.map((item, idx) => (
                    <div
                      key={`${order._id}-${item.product || idx}`}
                      className="order-item-row"
                    >
                      <div className="item-name-col">
                        <span className="item-name-text">{item.name}</span>
                        <span className="item-qty-tag">Qty: {item.quantity}</span>
                      </div>
                      <div className="item-status-col">
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
                      <div className="item-price-col">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Footer: Address, Total & Actions */}
              <div className="order-card-footer">
                <div className="order-footer-details">
                  <div className="detail-item">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">
                      {order.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : "Razorpay (Online Payment)"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Delivery Address:</span>
                    <span className="detail-value">{order.shippingAddress}</span>
                  </div>
                </div>

                <div className="order-footer-action-col">
                  <div className="order-grand-total">
                    <span className="total-label">Grand Total:</span>
                    <span className="total-value">₹{Number(order.total).toLocaleString("en-IN")}</span>
                  </div>

                  {canCancel && (
                    <button
                      type="button"
                      className="btn-danger cancel-order-btn"
                      onClick={() => onCancelOrder(order._id)}
                      disabled={cancelingOrderId === order._id}
                    >
                      {cancelingOrderId === order._id ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default OrderHistory;
