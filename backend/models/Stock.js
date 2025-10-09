const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },  
  name: { type: String, required: true },

  currentPrice: { type: Number, required: true },  // live price
  lastPrice: { type: Number },                     // last trade price
  openPrice: { type: Number },                     // day open
  closePrice: { type: Number },                    // day close
  dayHigh: { type: Number },
  dayLow: { type: Number },

  availableShares: { type: Number, required: true },  // dummy exchange me kitne shares
  totalBuyOrders: { type: Number, default: 0 },
  totalSellOrders: { type: Number, default: 0 },

  history: [
    {
      time: { type: Date, default: Date.now },
      open: Number,
      high: Number,
      low: Number,
      close: Number,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Stock", stockSchema);
