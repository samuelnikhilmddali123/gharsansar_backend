const mongoose = require("mongoose");

const categoryDiscountSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    description: {
      type: String,
      default: ""
    },
    affectedProductsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: "category_discounts"
  }
);

// Helper method to check if discount is currently effective
categoryDiscountSchema.methods.isCurrentlyActive = function () {
  if (this.status !== "active") return false;
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  end.setHours(23, 59, 59, 999);
  return now >= start && now <= end;
};

const CategoryDiscount = mongoose.models.CategoryDiscount || mongoose.model("CategoryDiscount", categoryDiscountSchema);

module.exports = CategoryDiscount;
