const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    id: { type: String }, // alias for productId used by frontend
    variantId: { type: String, default: "" },
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    image: { type: String, default: "" },
    selectedSize: { type: String, default: "" },
    selectedColor: { type: String, default: "" },
    isReturnGift: { type: Boolean, default: false },
    stock: { type: Number },
    priceAtAddition: { type: Number },
    addedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true,
    collection: "carts"
  }
);

// Helper to compute cart totals
cartSchema.methods.getSummary = function () {
  const items = (this.items || []).map(item => {
    const itemObj = item.toObject ? item.toObject() : { ...item };
    if (!itemObj.id && itemObj.productId) {
      itemObj.id = itemObj.productId;
    }
    return itemObj;
  });

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

  return {
    _id: this._id,
    userId: this.userId,
    items,
    totalItems,
    totalPrice: Math.round(totalPrice * 100) / 100,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
