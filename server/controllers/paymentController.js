const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const crypto = require("crypto");
const razorpay = require("../config/razorpay");

async function createRazorpayOrder(req, res) {
  try {
    const { shippingAddress, items } = req.body || {};

    if (
      typeof shippingAddress !== "string" ||
      !shippingAddress.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Delivery address and cart items are required",
      });
    }

    const orderItems = [];
    const seenProductIds = new Set();
    let total = 0;

    for (const item of items) {
      if (
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Each cart item needs a valid product and quantity",
        });
      }

      if (seenProductIds.has(item.productId)) {
        return res.status(400).json({
          message: "Each product should appear only once in the cart",
        });
      }
      seenProductIds.add(item.productId);

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: "A product in the cart was not found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} does not have enough stock`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });

      total += product.price * item.quantity;
    }

    const amountInPaise = Math.round(total * 100);

    if (amountInPaise < 100) {
      return res.status(400).json({
        message: "The payment total must be at least ₹1",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    const order = await Order.create({
      customer: req.user._id,
      customerName: req.user.name,
      shippingAddress: shippingAddress.trim(),
      items: orderItems,
      total: amountInPaise / 100,
      paymentMethod: "Razorpay",
      paymentStatus: "Pending",
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      appOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message || "Could not create a payment order",
    });
  }
}

async function verifyRazorpayPayment(req, res) {
  const {
    appOrderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  try {
    if (
      !appOrderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment verification details are required",
      });
    }

    const order = await Order.findOne({
      _id: appOrderId,
      customer: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Order details do not match" });
    }

    if (order.paymentStatus === "Paid") {
      return res.json({ message: "Payment is already verified", order });
    }

    if (["Refunded", "Refund Pending"].includes(order.paymentStatus)) {
      return res.status(409).json({
        message: "This cancelled order’s payment refund is already recorded",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const expectedAmount = Math.round(order.total * 100);

    if (
      payment.order_id !== razorpay_order_id ||
      payment.amount !== expectedAmount ||
      payment.status !== "captured"
    ) {
      return res.status(400).json({
        message: "Payment is not captured or its details do not match",
      });
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const currentOrder = await Order.findById(appOrderId).session(session);

        if (!currentOrder || currentOrder.paymentStatus === "Paid") {
          throw new Error("Order was already processed");
        }

        if (currentOrder.status === "Cancelled") {
          throw new Error("ORDER_CANCELLED");
        }

        for (const item of currentOrder.items) {
          const stockUpdate = await Product.updateOne(
            {
              _id: item.product,
              stock: { $gte: item.quantity },
            },
            {
              $inc: { stock: -item.quantity },
            },
            { session }
          );

          if (stockUpdate.matchedCount === 0) {
            throw new Error(
              `Not enough stock for ${item.name}. Contact the store about this payment.`
            );
          }
        }

        currentOrder.paymentStatus = "Paid";
        currentOrder.razorpayPaymentId = razorpay_payment_id;
        currentOrder.status = "Confirmed";

        await currentOrder.save({ session });
      });

      const updatedOrder = await Order.findById(appOrderId);

      return res.json({
        message: "Payment verified and order confirmed",
        order: updatedOrder,
      });
    } catch (transactionError) {
      const latestOrder = await Order.findOne({
        _id: appOrderId,
        customer: req.user._id,
      });

      if (
        latestOrder?.status === "Cancelled" &&
        latestOrder.paymentStatus === "Pending"
      ) {
        const refund = await razorpay.payments.refund(razorpay_payment_id, {
          amount: expectedAmount,
          notes: {
            reason: "Order was cancelled before payment verification",
          },
        });

        if (!["processed", "pending"].includes(refund.status)) {
          throw new Error("The late payment refund could not be confirmed");
        }

        await Order.updateOne(
          {
            _id: appOrderId,
            customer: req.user._id,
            status: "Cancelled",
            paymentStatus: "Pending",
          },
          {
            $set: {
              paymentStatus:
                refund.status === "processed" ? "Refunded" : "Refund Pending",
              razorpayPaymentId: razorpay_payment_id,
              razorpayRefundId: refund.id,
            },
          }
        );

        return res.status(409).json({
          message:
            "The order was cancelled; the late payment refund was initiated",
        });
      }

      throw transactionError;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("Payment verification error:", error.message);

    return res.status(400).json({
      message: error.message || "Could not verify payment",
    });
  }
}

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};