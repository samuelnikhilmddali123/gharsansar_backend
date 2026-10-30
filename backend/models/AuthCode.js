const mongoose = require("mongoose");

const authCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    used: {
      type: Boolean,
      default: false,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index: auto-deletes expired codes
    }
  },
  {
    timestamps: true,
    collection: "auth_codes"
  }
);

module.exports = mongoose.model("AuthCode", authCodeSchema);

