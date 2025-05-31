require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const {
  sendOrderConfirmation,
  sendPaymentFailedEmail,
} = require("./services/emailService");
const Order = require("./models/Order");
const { updateInventory } = require("./services/inventoryService");

const app = express();

// Database connection
connectDB();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.NODE_ENV === "production"
      ? [process.env.PRODUCTION_URL]
      : ["http://localhost:3000", "http://127.0.0.1:3000"];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));

// Checkout Route
app.post("/api/checkout", async (req, res) => {
  try {
    const { customer, payment, cartItems, simulationCode } = req.body;

    // Validate input
    if (!customer || !payment || !cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (typeof customer.address !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid address format",
      });
    }

    // Process cart items
    const { orderItems, totalAmount } = await processCartItems(cartItems);
    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products in cart",
      });
    }

    // Create and save order
    const order = new Order(
      createOrderObject(customer, payment, orderItems, totalAmount)
    );
    const savedOrder = await order.save();

    // Process payment
    const paymentResult = await processPayment(savedOrder, simulationCode);

    // Update inventory if payment successful
    if (paymentResult.status === "approved") {
      console.log(orderItems);
      await handleInventoryUpdate(orderItems);
    }

    // Send response
    res.json({
      success: true,
      ...paymentResult,
      orderId: savedOrder._id,
      transactionId: savedOrder._id.toString(),
      amount: totalAmount,
      cartItems: savedOrder.items,
      payment: savedOrder.payment,
    });
  } catch (err) {
    handleCheckoutError(err, res);
  }
});

// Helper Functions
async function processCartItems(cartItems) {
  const orderItems = cartItems
    .map((item) => {
      const productId = item.id.split("-")[0];
      return {
        productId: mongoose.Types.ObjectId.isValid(productId)
          ? productId
          : null,
        name: item.name || "Unnamed Product",
        variant:
          item.variant || `${item.color || ""} ${item.size || ""}`.trim(),
        quantity: item.quantity || 1,
        price: item.price || 0,
        image: item.image || "",
      };
    })
    .filter((item) => item.productId);

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return { orderItems, totalAmount };
}

function createOrderObject(customer, payment, orderItems, totalAmount) {
  return {
    customer: {
      name: customer.name || "",
      email: customer.email || "",
      address: customer.address || "",
      phone: customer.phone || "",
    },
    items: orderItems,
    payment: {
      cardLastFour: payment.cardNumber.slice(-4),
      cardName: payment.cardName || "",
      amount: totalAmount,
      status: "pending",
    },
    status: "pending",
  };
}

async function handleInventoryUpdate(orderItems) {
  try {
    console.log(orderItems);
    await updateInventory(orderItems);
  } catch (err) {
    console.error("Inventory update failed:", err);
    // Optional: log this for manual resolution
  }
}

function handleCheckoutError(err, res) {
  console.error("Checkout error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.errors,
    });
  }

  if (err.message.includes("Inventory update failed")) {
    return res.status(409).json({
      success: false,
      message: "Order completed but inventory update failed",
      error: "INVENTORY_UPDATE_FAILED",
    });
  }

  res.status(500).json({
    success: false,
    message: "Server error during checkout",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}

const processPayment = async (order, simulationCode) => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      let response;

      switch (simulationCode) {
        case "1": // Approved
          order.payment.status = "completed";
          order.status = "processing";
          response = {
            status: "approved",
            message: "Transaction approved - Payment processed successfully",
          };

          try {
            await sendOrderConfirmation(order, order.customer.email);
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
          }
          break;

        case "2": // Declined
          order.payment.status = "declined";
          order.status = "payment_failed";
          response = {
            status: "declined",
            message: "Transaction declined - Payment was not authorized",
          };

          try {
            await sendPaymentFailedEmail(order, order.customer.email);
          } catch (emailError) {
            console.error("Failed to send payment failed email:", emailError);
          }
          break;

        case "3": // Gateway failure
          response = {
            status: "error",
            message: "Payment gateway timeout - Please try again later",
          };
          break;

        default: // Default to approved
          order.payment.status = "completed";
          order.status = "processing";
          response = {
            status: "approved",
            message: "Transaction approved - Payment processed successfully",
          };
      }

      await order.save();
      resolve(response);
    }, 1500);
  });
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
