const Order = require("../models/Order");
const { sendEmail } = require("../utils/mailer");

const processPayment = async (order, simulationCode) => {
  let response;

  switch (simulationCode) {
    case "1": // Approved
      order.payment.status = "completed";
      order.status = "processing";
      response = {
        status: "approved",
        message: "Transaction approved - Payment processed successfully",
      };
      await sendEmail(order.customer.email, "orderConfirmation", order);
      break;

    case "2": // Declined
      order.payment.status = "declined";
      order.status = "payment_failed";
      response = {
        status: "declined",
        message: "Transaction declined - Payment was not authorized",
      };
      await sendEmail(order.customer.email, "paymentFailed", order);
      break;

    case "3": // Gateway failure
      response = {
        status: "error",
        message: "Payment gateway timeout - Please try again later",
      };
      break;

    default:
      order.payment.status = "completed";
      order.status = "processing";
      response = {
        status: "approved",
        message: "Transaction approved - Payment processed successfully",
      };
  }

  await order.save();
  return response;
};

exports.createOrder = async (req, res) => {
  try {
    const { customer, payment, cartItems, simulationCode } = req.body;

    // Validate input
    if (!customer || !payment || !cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
    }

    // Process order
    const totalAmount = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const order = new Order({
      customer,
      items: cartItems.map((item) => ({
        productId: item.id.split("-")[0],
        name: item.name,
        variant: `${item.stock || 0} ${item.color || ""} ${
          item.size || ""
        }`.trim(),
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      payment: {
        cardLastFour: payment.cardNumber.slice(-4),
        cardName: payment.cardName,
        amount: totalAmount,
        status: "pending",
      },
      status: "pending",
    });

    const savedOrder = await order.save();
    const result = await processPayment(savedOrder, simulationCode);

    res.json({
      ...result,
      orderId: savedOrder._id,
      transactionId: savedOrder._id.toString(),
      amount: totalAmount,
      cartItems: savedOrder.items,
      payment: savedOrder.payment,
      customeremail: savedOrder.customer.email,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: err.errors,
      });
    }
    res.status(500).json({
      status: "error",
      message: "Server error during checkout",
      error: err.message,
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
