const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    productId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String, default: "" },
    selectedSize: { type: String, default: "" },
    selectedColor: { type: String, default: "" },
    isReturnGift: { type: Boolean, default: false }
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "India" },
    notes: { type: String, default: "" }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    customer: { type: customerSchema, required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "processing",
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "paid"
    },
    paymentId: { type: String, default: "" },
    paymentMethod: { type: String, default: "razorpay" },
    trackingNumber: { type: String, default: "" },
    notes: { type: String, default: "" }
  },
  {
    timestamps: true,
    collection: "orders"
  }
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
