const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const mongoose = require("mongoose");

const router = express.Router();

router.get(
  "/mine",
  authMiddleware,
  requireRole("customer"),
  async (req, res) => {
    try {
      const orders = await Order.find({
        customer: req.user._id,
      }).sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/seller",
  authMiddleware,
  requireRole("seller"),
  async (req, res) => {
    try {
      // Find products that belong to the signed-in seller.
      const sellerProducts = await Product.find({
        owner: req.user._id,
      }).select("_id");

      const productIds = sellerProducts.map((product) => product._id);

      if (productIds.length === 0) {
        return res.json([]);
      }

      // Find orders containing at least one of the seller's products.
      const orders = await Order.find({
        "items.product": { $in: productIds },
      }).sort({ createdAt: -1 });

      const sellerProductIds = new Set(
        productIds.map((productId) => productId.toString())
      );

      // Return only this seller's items from each order.
      const sellerOrders = orders.map((order) => {
        const sellerItems = order.items.filter((item) =>
          sellerProductIds.has(item.product.toString())
        );

        const sellerTotal = sellerItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
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
);

router.patch(
  "/:orderId/items/:productId/status",
  authMiddleware,
  requireRole("seller"),
  async (req, res) => {
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
        return res.status(400).json({
          message: "Invalid order item status."
        }
      );
      }

      const product =await Product.findOne({
        _id: productId,
        owner: req.user._id,
      });
      
      if (!product){
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
);

router.post("/", authMiddleware, requireRole("customer"), async (req, res) => {
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

        // Subtract stock only if enough stock remains.
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
});

module.exports = router;