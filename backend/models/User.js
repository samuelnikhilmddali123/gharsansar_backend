const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    id: { type: String },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    street_address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "India" },
    isDefault: { type: Boolean, default: false }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    id: { type: Number },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password_hash: { type: String, default: "" },
    full_name: { type: String, default: "" },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    company_name: { type: String, default: "" },
    gstin: { type: String, default: "" },
    role: {
      type: String,
      enum: ["ADMIN", "CUSTOMER"],
      default: "CUSTOMER"
    },
    is_active: { type: Boolean, default: true },
    firebase_uid: { type: String, default: "" },
    photo_url: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    street_address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    created_at: { type: String },
    addresses: [addressSchema]
  },
  {
    timestamps: true,
    collection: "users"
  }
);

// Virtual for id consistency
userSchema.virtual("userId").get(function () {
  return this._id ? this._id.toString() : String(this.id);
});

// Format user for safe API responses
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject ? this.toObject() : { ...this };
  delete obj.password_hash;
  return {
    _id: obj._id,
    id: typeof obj.id === "number" ? obj.id : 1,
    email: obj.email || "",
    full_name: (obj.full_name || obj.name || "").trim(),
    name: (obj.full_name || obj.name || "").trim(),
    phone: (obj.phone || "").replace(/\D/g, ""),
    company_name: obj.company_name || "",
    gstin: obj.gstin || "",
    role: (obj.role && obj.role.toLowerCase() === "admin") ? "ADMIN" : "CUSTOMER",
    is_active: obj.is_active !== undefined ? Boolean(obj.is_active) : true,
    firebase_uid: obj.firebase_uid || "",
    photo_url: obj.photo_url || obj.profilePicture || "",
    profilePicture: obj.photo_url || obj.profilePicture || "",
    street_address: obj.street_address || (obj.addresses && obj.addresses[0] ? (obj.addresses[0].address || obj.addresses[0].street_address || "") : ""),
    city: obj.city || (obj.addresses && obj.addresses[0] ? obj.addresses[0].city || "" : ""),
    state: obj.state || (obj.addresses && obj.addresses[0] ? obj.addresses[0].state || "" : ""),
    pincode: obj.pincode || (obj.addresses && obj.addresses[0] ? (obj.addresses[0].zipCode || obj.addresses[0].pincode || "") : ""),
    addresses: obj.addresses || [],
    createdAt: obj.createdAt || obj.created_at || new Date(),
    updatedAt: obj.updatedAt || new Date()
  };
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
