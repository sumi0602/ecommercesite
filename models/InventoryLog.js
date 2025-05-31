const mongoose = require("mongoose");

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    change: { type: Number, required: true }, // Positive for addition, negative for reduction
    remaining: { type: Number, required: true },
    reason: {
      type: String,
      required: true,
      enum: ["order_fulfillment", "restock", "adjustment", "return"],
    },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    notes: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // If you have user system
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryLog", inventoryLogSchema);
