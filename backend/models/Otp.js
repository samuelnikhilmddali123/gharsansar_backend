const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    otp: {
      type: String,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL index automatically removes expired OTPs
    }
  },
  {
    timestamps: true,
    collection: "otps"
  }
);

// Helpful index on email + verified
otpSchema.index({ email: 1, verified: 1, createdAt: -1 });

module.exports = mongoose.model("Otp", otpSchema);
