// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stockSymbol: { type: String, required: true },
  side: { type: String, enum: ["BUY", "SELL"], required: true },
  quantity: { type: Number, required: true },
  orderType: { type: String, enum: ["MARKET", "LIMIT", "STOPLOSS"], default: "MARKET" },
  limitPrice: { type: Number },      // for LIMIT orders
  stopLossPrice: { type: Number },   // for STOPLOSS orders (trigger price)
  status: { type: String, enum: ["PENDING", "EXECUTED", "CANCELLED"], default: "PENDING" },
  placedAt: { type: Date, default: Date.now },
  executedAt: { type: Date }
});

module.exports = mongoose.model('Order', orderSchema);
