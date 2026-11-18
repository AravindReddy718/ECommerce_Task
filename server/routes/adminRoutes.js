const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/sellers/pending",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const sellers = await User.find({
        role: "seller",
        sellerApproved: false,
      }).select("name email createdAt");

      res.json(sellers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/sellers/:id/approve",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const seller = await User.findOneAndUpdate(
        { _id: req.params.id, role: "seller" },
        { sellerApproved: true },
        { new: true }
      ).select("name email role sellerApproved");

      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      res.json({ message: "Seller approved", seller });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;