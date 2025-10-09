const Stock = require('../models/Stock');
const OrderService = require('../services/orderService');
const Watchlist = require('../models/watchlist');

const ioHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    const updateWatchlistAndEmit = async (stock) => {
      // Update watchlist items
      await Watchlist.updateMany(
        { stockSymbol: stock.symbol },
        {
          $set: {
            previousPrice: stock.lastPrice,
            currentPrice: stock.currentPrice
          }
        }
      );

      // Emit data in correct format for frontend
      io.emit("stockUpdated", {
        stockSymbol: stock.symbol,      // ✅ match frontend
        currentPrice: stock.currentPrice,
        previousPrice: stock.lastPrice
      });
    };

    socket.on("buyStock", async ({ symbol, quantity }) => {
      try {
        const stock = await Stock.findOne({ symbol });
        if (!stock) return;

        stock.totalBuyOrders += quantity;
        stock.availableShares -= quantity;
        stock.lastPrice = stock.currentPrice;
        stock.currentPrice += stock.currentPrice * 0.01;
        stock.dayHigh = Math.max(stock.dayHigh, stock.currentPrice);
        stock.dayLow = Math.min(stock.dayLow, stock.currentPrice);
        await stock.save();

        await updateWatchlistAndEmit(stock);

        // Check pending LIMIT/STOPLOSS orders
        await OrderService.checkAndExecutePendingOrders(stock, io);

      } catch (err) {
        console.error("Socket buy error:", err.message);
      }
    });

    socket.on("sellStock", async ({ symbol, quantity }) => {
      try {
        const stock = await Stock.findOne({ symbol });
        if (!stock) return;

        stock.totalSellOrders += quantity;
        stock.availableShares += quantity;
        stock.lastPrice = stock.currentPrice;
        stock.currentPrice -= stock.currentPrice * 0.01;
        stock.dayHigh = Math.max(stock.dayHigh, stock.currentPrice);
        stock.dayLow = Math.min(stock.dayLow, stock.currentPrice);
        await stock.save();

        await updateWatchlistAndEmit(stock);

        // Check pending LIMIT/STOPLOSS orders
        await OrderService.checkAndExecutePendingOrders(stock, io);

      } catch (err) {
        console.error("Socket sell error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

module.exports = ioHandler;

/*const Stock = require('../models/Stock');
const OrderService = require('../services/orderService');
const Watchlist=require('../models/watchlist')
const ioHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("buyStock", async ({ symbol, quantity }) => {
      try {
        const stock = await Stock.findOne({ symbol });
        if (!stock) return;

        // Update stock immediately for MARKET simulation
        stock.totalBuyOrders += quantity;
        stock.availableShares -= quantity;
        const priceChange = stock.currentPrice * 0.01;
        stock.lastPrice = stock.currentPrice;
        stock.currentPrice += priceChange;
        stock.dayHigh = Math.max(stock.dayHigh, stock.currentPrice);
        stock.dayLow = Math.min(stock.dayLow, stock.currentPrice);
        await stock.save();
          await Watchlist.updateMany(
          { stockSymbol: stock.symbol },
          {
            $set: {
              previousPrice: stock.lastPrice,
              currentPrice: stock.currentPrice
            }
          }
        );
       io.emit("stockUpdated", stock.toObject());
    
        // Check pending LIMIT/STOPLOSS orders for this stock
        await OrderService.checkAndExecutePendingOrders(stock, io);

        
      } catch (err) {
        console.error("Socket buy error:", err.message);
      }
    });

    socket.on("sellStock", async ({ symbol, quantity }) => {
      try {
        const stock = await Stock.findOne({ symbol });
        if (!stock) return;

        stock.totalSellOrders += quantity;
        stock.availableShares += quantity;
        const priceChange = stock.currentPrice * 0.01;
        stock.lastPrice = stock.currentPrice;
        stock.currentPrice -= priceChange;
        stock.dayHigh = Math.max(stock.dayHigh, stock.currentPrice);
        stock.dayLow = Math.min(stock.dayLow, stock.currentPrice);
        await stock.save();
          await Watchlist.updateMany(
          { stockSymbol: stock.symbol },
          {
            $set: {
              previousPrice: stock.lastPrice,
              currentPrice: stock.currentPrice
            }
          }
        );
  io.emit("stockUpdated", stock.toObject());
        // Check pending LIMIT/STOPLOSS orders for this stock
        await OrderService.checkAndExecutePendingOrders(stock, io);

      
      } catch (err) {
        console.error("Socket sell error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

module.exports = ioHandler;*/
