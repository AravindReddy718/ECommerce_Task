const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, requireRole("customer"), async (req, res) => {
  try {
    const { shippingAddress, items } = req.body;

    if (!shippingAddress || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Delivery address and cart items are required",
      });
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({
          message: "Each item must have a quantity of at least 1",
        });
      }

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

    const order = await Order.create({
      customer: req.user._id,
      customerName: req.user.name,
      shippingAddress,
      items: orderItems,
      total,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;