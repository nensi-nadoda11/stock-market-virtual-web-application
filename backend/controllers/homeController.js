const Indice = require("../models/Indices");
const Stock = require("../models/Stock");

const getHomeData = async (req, res) => {
  try {
    const indices = await Indice.find().sort({ symbol: 1 });
    const stocks = await Stock.find({})
      .select("symbol name currentPrice dayHigh dayLow availableShares")
      .sort({ symbol: 1 });

    return res.status(200).json({
      success: true,
      message: "Home Data Fetched Successfully",
      data: { indices, stocks },
    });
  } catch (error) {
    console.error("getHomeData error:", error.message);
    return res.status(500).json({ message: "Failed to fetch data" });
  }
};

module.exports = { getHomeData };
