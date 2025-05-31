// controllers/inventoryController.js
const Product = require("../models/Product");

exports.getInventoryByProductId = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      productId: product._id,
      stock: product.stock,
      variants: product.variants,
    });
  } catch (err) {
    console.error("Error fetching inventory:", err);
    res.status(500).json({ message: "Server error" });
  }
};
