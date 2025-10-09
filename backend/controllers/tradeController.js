const Stock=require('../models/Stock')
const Portfolio=require('../models/Portfolio')
const Transaction=require('../models/Transaction')
const Account=require('../models/Account')
const Order=require('../models/order')
const orderService=require('../services/orderService')
const socket=require('../services/socket_io')

exports.buyStock = async (req, res) => {
  try {
    const io=socket.getIO()
    let { symbol, quantity, orderType = "MARKET", limitPrice, stopLossPrice, price } = req.body;
    const userId = req.user.userId;

    orderType = orderType.toUpperCase();
    if (orderType === "LIMIT" && !limitPrice && price) limitPrice = price;

    if (orderType === 'MARKET') {
      const stock = await Stock.findOne({ symbol });
      if (!stock) return res.status(404).json({ message: "Stock not found" });
      if (stock.availableShares < quantity) return res.status(400).json({ message: "Not enough shares available" });

      const wallet = await Account.findOne({ user: userId });
      if (!wallet) return res.status(404).json({ message: "Wallet not found" });

      const totalCost = stock.currentPrice * quantity;
      if (wallet.walletBalance < totalCost) return res.status(400).json({ message: "Insufficient wallet balance" });

      wallet.walletBalance -= totalCost;
      await wallet.save();

      let portfolio = await Portfolio.findOne({ userId, stockSymbol: symbol });
      if (!portfolio) portfolio = new Portfolio({ userId, stockSymbol: symbol, quantity: 0, avgPrice: stock.currentPrice });

      const newTotalCost = portfolio.quantity * portfolio.avgPrice + totalCost;
      const newQuantity = portfolio.quantity + quantity;
      portfolio.avgPrice = newTotalCost / newQuantity;
      portfolio.quantity = newQuantity;
      await portfolio.save();

      const transaction = new Transaction({ userId, stockSymbol: symbol, type: "BUY", quantity, price: stock.currentPrice });
      await transaction.save();

      stock.availableShares -= quantity;
      stock.totalBuyOrders += quantity;
      const priceChange = stock.currentPrice * 0.01;
      stock.lastPrice = stock.currentPrice;
      stock.currentPrice += priceChange;
      stock.dayHigh = Math.max(stock.dayHigh, stock.currentPrice);
      stock.dayLow = Math.min(stock.dayLow, stock.currentPrice);
      await stock.save();
       io.emit("stockUpdated", stock.toObject());

      return res.status(200).json({ message: "Stock bought successfully", portfolio, transaction, wallet });
    }

    // LIMIT / STOPLOSS → pending order
    try {
      const order = await orderService.placeOrder({ userId, stockSymbol: symbol, side: "BUY", quantity, orderType, limitPrice, stopLossPrice });
      return res.status(200).json({ message: "Order placed successfully", order });
    } catch (err) {
      return res.status(400).json({ message: err.message || "Failed to place order" });
    }
  } catch (error) {
    console.error("Buy error", error);
    return res.status(500).json({ message: "Server error" });
  }
}
exports.sellStock = async (req, res) => {
  try {
    const io=socket.getIO()
    let { symbol, quantity, orderType = "MARKET", limitPrice, stopLossPrice, price } = req.body;
    const userId = req.user.userId;

    orderType = orderType.toUpperCase();
    if (orderType === "LIMIT" && !limitPrice && price) limitPrice = price;

    if (orderType === 'MARKET') {
      const stock = await Stock.findOne({ symbol });
      if (!stock) return res.status(404).json({ message: "Stock not found" });

      const portfolio = await Portfolio.findOne({ userId, stockSymbol: symbol });
      if (!portfolio || portfolio.quantity < quantity) return res.status(400).json({ message: "Not enough shares in portfolio" });

      const wallet = await Account.findOne({ user: userId });
      if (!wallet) return res.status(404).json({ message: "Wallet not found" });

      const totalAmount = stock.currentPrice * quantity;
      wallet.walletBalance += totalAmount;
      await wallet.save();

      portfolio.quantity -= quantity;
      await portfolio.save();

      const transaction = new Transaction({ userId, stockSymbol: symbol, type: "SELL", quantity, price: stock.currentPrice });
      await transaction.save();

      stock.availableShares += quantity;
      stock.totalSellOrders += quantity;
      const priceChange = stock.currentPrice * 0.01;
      stock.lastPrice = stock.currentPrice;
      stock.currentPrice -= priceChange;
      stock.dayHigh = Math.max(stock.dayHigh, stock.currentPrice);
      stock.dayLow = Math.min(stock.dayLow, stock.currentPrice);
      await stock.save();
 io.emit("stockUpdated", stock.toObject());
      if (portfolio.quantity === 0) await Portfolio.deleteOne({ _id: portfolio._id });

      return res.status(200).json({ message: "Stock sold successfully", portfolio, transaction, wallet });
    }

    // LIMIT / STOPLOSS → pending order
    try {
      const order = await orderService.placeOrder({ userId, stockSymbol: symbol, side: "SELL", quantity, orderType, limitPrice, stopLossPrice });
      return res.status(200).json({ message: "Sell order placed successfully", order });
    } catch (err) {
      return res.status(400).json({ message: err.message || "Failed to place sell order" });
    }
  } catch (error) {
    console.error("Sell error", error);
    return res.status(500).json({ message: "Server error" });
  }
}
exports.modifyPendingOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { quantity, limitPrice, stopLossPrice } = req.body;
    const userId = req.user.userId;

    const order = await Order.findOne({ _id: orderId, userId, status: 'PENDING' });
    if (!order) return res.status(404).json({ message: "Pending order not found" });

    if (quantity) order.quantity = quantity;
    if (limitPrice) order.limitPrice = limitPrice;
    if (stopLossPrice !== undefined) order.stopLossPrice = stopLossPrice;

    await order.save();
    return res.status(200).json({ message: "Order modified successfully", order });
  } catch (err) {
    console.error("Modify order error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId }).sort({ placedAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

exports.getPortfolio=async(req,res)=>{
  try{
    const userId=req.user.userId
    const portfolio=await Portfolio.find({userId})

    if(!portfolio || portfolio.length==0)
    {
      return res.status(200).json({message:"No holding yet",portfolio})
    }

    const result=[]
    for(let p of portfolio)
    {
      const stock=await Stock.findOne({symbol:p.stockSymbol})

      if(!stock) continue

      const investedAmount = p.quantity * p.avgPrice
      const currentValue=p.quantity * stock.currentPrice
      const profitLoss = currentValue - investedAmount
      const profitLossPercent = investedAmount > 0 ? ((profitLoss / investedAmount) * 100).toFixed(2):0

      result.push({
        symbol: p.stockSymbol,
        quantity : p.quantity,
        avgPrice : p.avgPrice,
        currentPrice : stock.currentPrice,
        investedAmount,
        currentValue,
        profitLoss,
        profitLossPercent
        
      })
    }
    return res.status(200).json({portfolio:result})
  }catch(error)
  {
     console.error("Get Portfolio error:",error)
     res.status(500).json({message:"Server error"})
  }
}


/*exports.getTransactionsBySymbol = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { symbol } = req.params;

    const transactions = await Transaction.find({ userId, stockSymbol: symbol })
      .sort({ date: 1 }); // पुरानी से नई order में

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({ message: "No transactions found", transactions: [] });
    }

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Get Transactions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};*/
exports.getTransactionsBySymbol = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { symbol } = req.params;

    const transactions = await Transaction.find({ userId, stockSymbol: symbol })
      .sort({ date: 1 }); // oldest first

    let lots = [];

    for (let tx of transactions) {
      if (tx.type === "BUY") {
        lots.push({ quantity: tx.quantity, price: tx.price, date: tx.date });
      } else if (tx.type === "SELL") {
        let qtyToSell = tx.quantity;
        while (qtyToSell > 0 && lots.length > 0) {
          if (lots[0].quantity <= qtyToSell) {
            qtyToSell -= lots[0].quantity;
            lots.shift(); // remove this lot fully
          } else {
            lots[0].quantity -= qtyToSell;
            qtyToSell = 0;
          }
        }
      }
    }

    res.status(200).json({ transactions: lots });
  } catch (error) {
    console.error("Get Transactions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getTransaction = async(req,res)=>{
  try
  {
    const userId=req.user.userId
    const transaction=await Transaction.find({userId}).sort({date:-1})
    res.status(200).json({transaction})
  }
  catch(error)
  {
    console.error("Transaction fetch error:",error)
    res.status(500).json({message:"Server error"})
  }
}
exports.deleteTransaction=async(req,res)=>{
  try{
    const {id}=req.params
    const transaction=await Transaction.findOneAndDelete({
      _id:id,
      userId:req.user.userId
    })

    if(!transaction)
      return res.status(404).json({message:"transaction not found"})
   
    res.status(200).json({message:"Transaction deleted successfully"})
  }
  catch(error)
  {
    console.error("Error deleting transaction",error)
    res.status(500).json({message:"server error"})
  }
}
exports.deleteAllTransaction=async(req,res)=>{
  try{
    await Transaction.deleteMany({userId:req.user.userId})
    res.status(200).json({message:"All transaction deleted successfully"})
  }catch(error)
  {
    console.error("error deleting all transaction",error)
    res.status(400).json({message:"server error"})
  }
}