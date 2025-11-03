const Watchlist = require("../models/watchList");
const Stock = require("../models/Stock");
const socket = require("../services/socket_io");

exports.addToWatchList = async (req, res) => {
  try {
    const { stockSymbol } = req.body;

    const stock = await Stock.findOne({ symbol: stockSymbol });
    if (!stock) return res.status(404).json({ message: "Stock not found" });

    const exists = await Watchlist.findOne({
      userId: req.user.userId,
      stockSymbol,
    });
    if (exists)
      return res.status(400).json({ message: "Stock already in watchlist" });

    const newStock = new Watchlist({
      userId: req.user.userId,
      stockSymbol,
      currentPrice: Number(stock.currentPrice),
      previousPrice: Number(stock.currentPrice),
    });

    await newStock.save();
    res.status(201).json(newStock);
  } catch (error) {
    res.status(500).json({ message: "Error adding stock to watchlist" });
  }
};
exports.getWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ userId: req.user.userId });
    res.status(200).json({ watchlist });
  } catch (error) {
    res.status(500).json({ message: "Error fetching watchlist", error });
  }
};
exports.removeFromWatchlist = async (req, res) => {
  try {
    const { id } = req.params;
    await Watchlist.findOneAndDelete({ _id: id, userId: req.user.userId });
    res.status(200).json({ message: "Stock removed from watchlist" });
  } catch (error) {
    res.status(500).json({ message: "Error removing stock", error });
  }
};
exports.clearWatchlist = async (req, res) => {
  try {
    console.log("userid", req.user.userId);
    await Watchlist.deleteMany({ userId: req.user.userId });
    res.status(200).json({ message: "all watchlist cleared" });
  } catch (error) {
    res.status(500).json({ message: "error clearing watchlist", error });
  }
};
/*exports.updatePriceOnStockChange = async (stock, io) => {
  try {
    const io=socket.getIO()
    const watchlistItems = await Watchlist.find({ stockSymbol: stock.symbol });

    for (let item of watchlistItems) {
      item.previousPrice = item.currentPrice;
      item.currentPrice = stock.currentPrice;
      await item.save();

      // 🔹 Ab portfolio ki tarah same event emit karenge
      io.emit("stockUpdated", {
        symbol: item.stockSymbol,
        newPrice: item.currentPrice
      });
      console.log("EMIT STOCKUPDATE =>", item.stockSymbol, item.currentPrice);
    }
  } catch (error) {
    console.error("Error updating watchlist prices:", error.message);
  }
};*/
