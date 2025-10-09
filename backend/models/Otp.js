const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  identifier: String,  // email or mobile
  otpHash: String,
  expiresAt: { type: Date, index: { expires: 30000 } },
}, { timestamps: true });

module.exports = mongoose.model("Otp", otpSchema);
