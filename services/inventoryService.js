const Product = require("../models/Product");
const InventoryLog = require("../models/InventoryLog");

async function updateInventory(orderItems) {
  for (const item of orderItems) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error("Product not found");

    const { color, size } = parseVariant(item.variant);

    const variant = product.variants.find(
      (v) =>
        v.color?.toLowerCase() === color.toLowerCase() &&
        v.size?.toLowerCase() === size.toLowerCase()
    );

    if (!variant) {
      console.error("Available variants:", product.variants);
      throw new Error(`Product variant not found: ${item.variant}`);
    }

    if (variant.stock < item.quantity) {
      throw new Error(`Insufficient stock for variant: ${item.variant}`);
    }

    variant.stock -= item.quantity;
    await product.save();

    const log = new InventoryLog({
      product: product._id,
      change: -item.quantity,
      remaining: variant.stock,
      reason: "order_fulfillment",
    });
    await log.save();
  }
}

function parseVariant(variantString) {
  const parts = variantString.split(" ");
  const color = parts[0] || "";
  const size = parts[1] || "";
  return { color, size };
}

module.exports = { updateInventory };
