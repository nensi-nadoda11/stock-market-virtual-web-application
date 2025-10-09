// models/Portfolio.js
const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stockSymbol: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  avgPrice: { type: Number, default: 0 }, // average buy price
  blockedQuantity: { type: Number, default: 0 } // reserved for pending sell orders
});

module.exports = mongoose.model("Portfolio", portfolioSchema);
