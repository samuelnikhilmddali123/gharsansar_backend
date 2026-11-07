const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    image: { type: String, default: "" },
    category: { type: String, default: "" },
    addedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    items: [wishlistItemSchema],
    productIds: [{ type: String }]
  },
  {
    timestamps: true,
    collection: "wishlists"
  }
);

// Synchronize productIds array before saving
wishlistSchema.pre("save", function () {
  if (this.items) {
    const ids = new Set();
    const uniqueItems = [];
    for (const item of this.items) {
      if (item.productId && !ids.has(item.productId)) {
        ids.add(item.productId);
        uniqueItems.push(item);
      }
    }
    this.items = uniqueItems;
    this.productIds = Array.from(ids);
  } else {
    this.productIds = [];
  }
});

module.exports = mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);
