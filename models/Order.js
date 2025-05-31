const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    required: false,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    required: false,
  },
});

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: false,
  },
});

const paymentSchema = new mongoose.Schema({
  cardLastFour: {
    type: String,
    required: true,
  },
  cardName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "declined", "failed"],
    default: "pending",
  },
});

const orderSchema = new mongoose.Schema({
  customer: {
    type: customerSchema,
    required: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
  },
  payment: {
    type: paymentSchema,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled", "payment_failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
