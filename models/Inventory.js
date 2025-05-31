const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    unique: true,
    required: true,
  },
  variants: [
    {
      color: String,
      size: String,
      stock: {
        type: Number,
        required: true,
      },
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Inventory", InventorySchema);
