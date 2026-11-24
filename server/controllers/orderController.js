const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({
      customer: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
async function getSellerOrders(req, res) {
  try {
    const sellerProducts = await Product.find({
      owner: req.user._id,
    }).select("_id");

    const productIds = sellerProducts.map((product) => product._id);

    if (productIds.length === 0) {
      return res.json([]);
    }

    const orders = await Order.find({
      "items.product": { $in: productIds },
    }).sort({ createdAt: -1 });

    const sellerProductIds = new Set(
      productIds.map((productId) => productId.toString())
    );

    const sellerOrders = orders.map((order) => {
      const sellerItems = order.items.filter((item) =>
        sellerProductIds.has(item.product.toString())
      );

      const isOrderCancelled = order.status === "Cancelled";
      const sellerTotal = isOrderCancelled
        ? 0
        : sellerItems.reduce(
            (sum, item) =>
              item.status === "Cancelled"
                ? sum
                : sum + item.price * item.quantity,
            0
          );

      return {
        ...order.toObject(),
        items: sellerItems,
        sellerTotal,
      };
    });

    res.json(sellerOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateOrderItemStatus(req, res) {
  try {
    const { orderId, productId } = req.params;
    const { status } = req.body;
    const allowedStatuses = [
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (
      !mongoose.isValidObjectId(orderId) ||
      !mongoose.isValidObjectId(productId)
    ) {
      return res.status(400).json({ message: "Invalid orderId or productId" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order item status." });
    }

    const product = await Product.findOne({
      _id: productId,
      owner: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or not owned by this seller",
      });
    }

    const result = await Order.updateOne(
      {
        _id: orderId,
        "items.product": productId,
      },
      {
        $set: { "items.$.status": status },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Order does not contain this product",
      });
    }

    res.json({ message: "Product order status updated", status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}



async function createDemoOrder(req, res) {
  let session;

  try {
    const { shippingAddress, items } = req.body;

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

    for (const item of items) {
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        !mongoose.isValidObjectId(item.productId)
      ) {
        return res.status(400).json({
          message: "Each cart item needs a valid product and quantity",
        });
      }
    }

    session = await mongoose.startSession();

    let savedOrder;

    await session.withTransaction(async () => {
      const orderItems = [];
      let total = 0;

      for (const item of items) {
        const product = await Product.findById(item.productId).session(session);

        if (!product) {
          const error = new Error("A product in the cart was not found");
          error.statusCode = 404;
          throw error;
        }

        const stockUpdate = await Product.updateOne(
          {
            _id: product._id,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          { session }
        );

        if (stockUpdate.matchedCount === 0) {
          const error = new Error(
            `${product.name} does not have enough stock`
          );
          error.statusCode = 400;
          throw error;
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        });

        total += product.price * item.quantity;
      }

      const [order] = await Order.create(
        [
          {
            customer: req.user._id,
            customerName: req.user.name,
            shippingAddress: shippingAddress.trim(),
            items: orderItems,
            total,
            paymentMethod: "COD",
            paymentStatus: "Pending",
          },
        ],
        { session }
      );

      savedOrder = order;
    });

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

async function cancelMyOrder(req, res) {
  let session;

  try {
    const { orderId } = req.params;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    session = await mongoose.startSession();

    let cancelledOrder;

    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: orderId,
        customer: req.user._id,
      }).session(session);

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      if (order.status === "Cancelled") {
        const error = new Error("This order is already cancelled");
        error.statusCode = 400;
        throw error;
      }

      if (order.paymentMethod !== "COD") {
        const error = new Error("Only COD orders can be cancelled");
        error.statusCode = 400;
        throw error;
      }

      const hasShippedItem = order.items.some((item) =>
        ["Shipped", "Delivered"].includes(item.status)
      );

      if (
        hasShippedItem ||
        ["Shipped", "Delivered"].includes(order.status)
      ) {
        const error = new Error(
          "An order cannot be cancelled after an item has shipped"
        );
        error.statusCode = 400;
        throw error;
      }

      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
          { session }
        );
      }

      order.status = "Cancelled";
      order.items.forEach((item) => {
        item.status = "Cancelled";
      });

      await order.save({ session });
      cancelledOrder = order;
    });

    return res.json({
      message: "Order cancelled",
      order: cancelledOrder,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Could not cancel the order",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

module.exports = { getMyOrders, getSellerOrders, updateOrderItemStatus, createDemoOrder , cancelMyOrder};