const Order = require('../models/order');
const Stock = require('../models/Stock');
const Account = require('../models/Account');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

async function placeOrder({ userId, stockSymbol, side, quantity, orderType, limitPrice, stopLossPrice }) {
  const order = new Order({ userId, stockSymbol, side, quantity, orderType, limitPrice, stopLossPrice });

  const account = await Account.findOne({ user: userId });
  if (!account) throw new Error('Account not found');

  if (orderType === 'LIMIT' && side === 'BUY') {
    const totalCost = limitPrice * quantity;
    const available = account.walletBalance - (Number(account.blockedAmount) || 0);
    if (available < totalCost) throw new Error('Insufficient wallet balance for limit buy');
    account.blockedAmount = (Number(account.blockedAmount) || 0) + totalCost;
    await account.save();
  }

  if (orderType === 'LIMIT' && side === 'SELL') {
    const portfolio = await Portfolio.findOne({ userId, stockSymbol });
    if (!portfolio || (portfolio.quantity - (portfolio.blockedQuantity || 0)) < quantity)
      throw new Error('Not enough shares for limit sell');
    portfolio.blockedQuantity = (portfolio.blockedQuantity || 0) + quantity;
    await portfolio.save();
  }

  await order.save();
  return order;
}

async function checkAndExecutePendingOrders(stock, io) {
  const pendingOrders = await Order.find({ stockSymbol: stock.symbol, status: 'PENDING' }).sort({ placedAt: 1 });
  for (const order of pendingOrders) {
    try {
      if (order.orderType === 'LIMIT') {
        if ((order.side === 'BUY' && stock.currentPrice <= order.limitPrice) ||
            (order.side === 'SELL' && stock.currentPrice >= order.limitPrice)) {
          await executeOrder(order, stock.currentPrice, io);
        }
      } else if (order.orderType === 'STOPLOSS') {
        if ((order.side === 'BUY' && stock.currentPrice >= order.stopLossPrice) ||
            (order.side === 'SELL' && stock.currentPrice <= order.stopLossPrice)) {
          await executeOrder(order, stock.currentPrice, io);
        }
      }
    } catch (err) {
      console.error('Pending order execution error:', order._id, err.message);
    }
  }
}

async function executeOrder(order, executionPrice, io) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const stock = await Stock.findOne({ symbol: order.stockSymbol }).session(session);
    const account = await Account.findOne({ user: order.userId }).session(session);
    let portfolio = await Portfolio.findOne({ userId: order.userId, stockSymbol: order.stockSymbol }).session(session);

    if (!stock || !account) throw new Error('Stock/Account missing at execution');

    const qty = order.quantity;
    const total = executionPrice * qty;

    if (order.side === 'BUY') {
      if (order.orderType === 'LIMIT') {
        const reserved = (order.limitPrice || 0) * qty;
        account.blockedAmount = Math.max(0, (Number(account.blockedAmount) || 0) - reserved);
      }
      account.walletBalance -= total;
      await account.save({ session });

      if (!portfolio) portfolio = new Portfolio({ userId: order.userId, stockSymbol: order.stockSymbol, quantity: 0, avgPrice: executionPrice });
      const newTotalCost = portfolio.quantity * portfolio.avgPrice + total;
      const newQty = portfolio.quantity + qty;
      portfolio.avgPrice = newTotalCost / newQty;
      portfolio.quantity = newQty;
      await portfolio.save({ session });

      const txn = new Transaction({ userId: order.userId, stockSymbol: order.stockSymbol, type: "BUY", quantity: qty, price: executionPrice });
      await txn.save({ session });

      stock.availableShares -= qty;
      stock.totalBuyOrders += qty;
      const priceChange = executionPrice * 0.01;
      stock.lastPrice = stock.currentPrice;
      stock.currentPrice += priceChange;
      stock.dayHigh = Math.max(stock.dayHigh || 0, stock.currentPrice);
      stock.dayLow = Math.min(stock.dayLow || stock.currentPrice, stock.currentPrice);
      await stock.save({ session });
      if (io) io.emit('stockUpdated', stock.toObject());


    } else if (order.side === 'SELL') {
      if (!portfolio || portfolio.quantity < qty) {
        order.status = 'CANCELLED';
        await order.save({ session });
        await session.commitTransaction();
        session.endSession();
        if (io) io.to(order.userId.toString()).emit('orderUpdate', { orderId: order._id, status: 'CANCELLED', reason: 'Not enough shares' });
        return;
      }
      if (order.orderType === 'LIMIT') portfolio.blockedQuantity = Math.max(0, (portfolio.blockedQuantity || 0) - qty);

      account.walletBalance += total;
      await account.save({ session });

      portfolio.quantity -= qty;
      await portfolio.save({ session });

      const txn = new Transaction({ userId: order.userId, stockSymbol: order.stockSymbol, type: "SELL", quantity: qty, price: executionPrice });
      await txn.save({ session });

      stock.availableShares += qty;
      stock.totalSellOrders += qty;
      const priceChange = executionPrice * 0.01;
      stock.lastPrice = stock.currentPrice;
      stock.currentPrice -= priceChange;
      stock.dayHigh = Math.max(stock.dayHigh || 0, stock.currentPrice);
      stock.dayLow = Math.min(stock.dayLow || stock.currentPrice, stock.currentPrice);
      await stock.save({ session });
      if (io) io.emit('stockUpdated', stock.toObject());

      if (portfolio.quantity === 0) await Portfolio.deleteOne({ _id: portfolio._id }).session(session);
    }

    order.status = 'EXECUTED';
    order.executedAt = new Date();
    await order.save({ session });

   // if (io) {
   //   io.emit('stockUpdated', stock.toObject());
   //   io.to(order.userId.toString()).emit('orderUpdate', { orderId: order._id, status: //'EXECUTED', executionPrice });
   // }
    await session.commitTransaction();
    session.endSession();
     if (io) {
      io.emit('stockUpdated', stock.toObject());
      io.to(order.userId.toString()).emit('orderUpdate', { orderId: order._id, status: 'EXECUTED', executionPrice });
    }

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('executeOrder error:', err.message);
    throw err;
  }
}

module.exports = { placeOrder, checkAndExecutePendingOrders, executeOrder };
