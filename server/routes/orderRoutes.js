const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
  getMyOrders,
  getSellerOrders,
  updateOrderItemStatus,
  createDemoOrder,
  cancelMyOrder,
} = require("../controllers/orderController");

const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");

const router = express.Router();

router.get(
  "/mine",
  authMiddleware,
  requireRole("customer"),
  getMyOrders
);

router.get(
  "/seller",
  authMiddleware,
  requireRole("seller"),
  getSellerOrders
);

router.patch(
  "/:orderId/items/:productId/status",
  authMiddleware,
  requireRole("seller"),
  updateOrderItemStatus
);

router.post(
  "/razorpay-order",
  authMiddleware,
  requireRole("customer"),
  createRazorpayOrder
);


router.post(
  "/verify-payment",
  authMiddleware,
  requireRole("customer"),
  verifyRazorpayPayment
);

router.post(
  "/",
  authMiddleware,
  requireRole("customer"),
  createDemoOrder
);

router.patch(
  "/:orderId/cancel",
  authMiddleware,
  requireRole("customer"),
  cancelMyOrder
);

module.exports = router;