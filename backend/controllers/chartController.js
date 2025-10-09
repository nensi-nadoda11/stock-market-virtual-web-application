const yahooFinance = require("yahoo-finance2").default;
const Chart = require("../models/Chart");

const getChartData = async (req, res) => {
  try {
    const { symbol } = req.params;
    const interval = req.query.interval || "1m";
    const range = req.query.range || "1d";

    const period1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 din pehle
    const period2 = new Date();

    const result = await yahooFinance.chart(symbol, {
      period1,
      period2,
      interval,
    });

    if (!result.quotes || result.quotes.length == 0) {
      return res.status(404).json({ message: "No chart data found" });
    }

    const chartData = result.quotes.map((q) => ({
      time: new Date(q.date).getTime() / 1000,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    }));

    await Chart.findOneAndUpdate(
      { symbol, interval },
      { symbol, interval, data: chartData, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
    return res.status(200).json({
      symbol,
      interval,
      chartData,
    });
  } catch (error) {
    console.log("Error fetching chart data :", error.message);
    return res.status(500).json({ message: "Error fetching chart data" });
  }
};
module.exports = { getChartData };
