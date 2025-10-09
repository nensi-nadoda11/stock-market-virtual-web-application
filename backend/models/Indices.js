const mongoose = require("mongoose");

const indiceSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true }, // NIFTY, SENSEX
  name: { type: String, required: true },
  value: { type: Number, required: true },
  change: { type: Number, default: 0 },
  changePercent: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Indice", indiceSchema);
