const mongoose = require("mongoose");
const connectDB = require("./db/mongoose");
const Product = require("./models/Product");
const Inventory = require("./models/Inventory"); // Your inventory model

// Generate shirt variants by color and size
function generateVariants(colors, sizes, baseQuantity = 10) {
  return colors.flatMap((color) =>
    sizes.map((size) => ({
      color,
      size,
      quantity: Math.floor(Math.random() * 40) + baseQuantity,
      stock: Math.floor(Math.random() * 40) + baseQuantity, // keep stock in sync or set default 0
    }))
  );
}

const shirtProducts = [
  {
    name: "Classic White Shirt",
    description: "A timeless white cotton shirt for any occasion.",
    price: 39.99,
    image: "white-shirt.jpg",
    category: "Shirts",
    variants: generateVariants(["White"], ["S", "M", "L", "XL"]),
  },
  {
    name: "Denim Shirt",
    description: "Stylish denim shirt with buttoned cuffs and collar.",
    price: 59.99,
    image: "denim-shirt.jpg",
    category: "Shirts",
    variants: generateVariants(["Blue", "Dark Blue"], ["M", "L", "XL"]),
  },
  {
    name: "Flannel Plaid Shirt",
    description: "Warm and cozy flannel shirt in red plaid pattern.",
    price: 49.99,
    image: "plaid-shirt.jpg",
    category: "Shirts",
    variants: generateVariants(["Red", "Green"], ["S", "M", "L"]),
  },
];

const seedShirtProductsAndInventory = async () => {
  try {
    console.log("🌱 Seeding shirt products and inventory...");
    await connectDB();
    console.log("🔌 Connected to MongoDB");

    // Remove old shirts and inventories
    await Product.deleteMany({ category: "Shirts" });
    console.log("🧹 Old shirt products removed");

    await Inventory.deleteMany({
      productId: {
        $in: (await Product.find({ category: "Shirts" })).map((p) => p._id),
      },
    });
    console.log("🧹 Old inventory for shirts removed");

    // Insert products
    const products = await Product.insertMany(shirtProducts);
    console.log(`✅ Seeded ${products.length} shirt products`);

    // Prepare inventory documents - one inventory doc per product
    const inventoryDocs = products.map((product) => ({
      productId: product._id,
      variants: product.variants.map((v) => ({
        color: v.color,
        size: v.size,
        quantity: v.quantity,
        stock: v.stock || 0,
      })),
    }));

    // Insert inventory documents
    await Inventory.insertMany(inventoryDocs);
    console.log(`✅ Seeded ${inventoryDocs.length} inventory records`);

    // Log summary
    products.forEach((product) => {
      const totalStock = product.variants.reduce(
        (sum, v) => sum + v.quantity,
        0
      );
      console.log(
        `📦 ${product.name} — Variants: ${product.variants.length}, Total Stock: ${totalStock}`
      );
    });
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit();
  }
};

seedShirtProductsAndInventory();
