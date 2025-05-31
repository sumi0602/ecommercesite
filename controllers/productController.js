const { updateInventory } = require("../services/inventoryService");

const Product = require("../models/Product");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    console.log(products);
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { variants, ...productData } = req.body;

    // If variants exist, set main stock to 0
    if (variants && variants.length > 0) {
      productData.stock = 0;
    }

    const product = new Product(productData);

    if (variants) {
      product.variants = variants;
    }

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors,
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { variants, ...updateData } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update variants if provided
    if (variants) {
      product.variants = variants;
    }

    // Update other fields
    Object.keys(updateData).forEach((key) => {
      product[key] = updateData[key];
    });

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { productId, variant, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (variant) {
      // Update variant stock
      const variantIndex = product.variants.findIndex(
        (v) => v.color === variant.color && v.size === variant.size
      );

      if (variantIndex === -1) {
        return res.status(404).json({ message: "Variant not found" });
      }

      product.variants[variantIndex].stock += quantity;
    } else {
      // Update main product stock
      product.stock += quantity;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAvailableVariants = async (req, res) => {
  try {
    const variants = await Product.getAvailableVariants(req.params.id);
    if (!variants) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(variants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.checkStock = async (req, res) => {
  try {
    const { productId, variant, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const isAvailable = product.checkStock(quantity, variant);
    res.json({ isAvailable });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
