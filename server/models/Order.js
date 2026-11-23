const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        status: {
          type: String,
          enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
          default: "Pending",
        },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Demo", "Pending", "Paid","Refund Pending",  "Refunded", "Failed"],      default: "Demo",
    },
    paymentMethod: {
      type: String,
      enum: ["Razorpay", "COD", "Demo"],
      default: null,
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);