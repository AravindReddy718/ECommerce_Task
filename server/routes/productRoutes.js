const express = require("express");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("owner", "name role");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.get(
  "/mine",
  authMiddleware,
  requireRole("seller", "admin"),
  async (req, res) => {
    try {
      const filter =
        req.user.role === "admin" ? {} : { owner: req.user._id };

      const products = await Product.find(filter)
        .populate("owner", "name role")
        .sort({ createdAt: -1 });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  }
);

router.post("/", authMiddleware, requireRole("seller", "admin"), async (req, res) => {
  try {
    let product = await Product.create({
      ...req.body,
      owner: req.user._id,
    });
    product = await product.populate("owner", "name role");
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch(
  "/:id",
  authMiddleware,
  requireRole("seller", "admin"),
  async (req, res) => {
    try {
      const allowedFields = [
        "name",
        "description",
        "price",
        "category",
        "image",
        "stock",
      ];

      const updates = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      const filter =
        req.user.role === "admin"
          ? { _id: req.params.id }
          : { _id: req.params.id, owner: req.user._id };

      const product = await Product.findOneAndUpdate(filter, updates, {
        new: true,
        runValidators: true,
      }).populate("owner", "name role");

      if (!product) {
        return res.status(404).json({
          message: "Product not found or you do not have access to it",
        });
      }

      res.json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("seller", "admin"),
  async (req, res) => {
    try {
      const filter =
        req.user.role === "admin"
          ? { _id: req.params.id }
          : { _id: req.params.id, owner: req.user._id };

      const product = await Product.findOneAndDelete(filter);

      if (!product) {
        return res.status(404).json({
          message: "Product not found or you do not have access to it",
        });
      }

      res.json({ message: "Product deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;