const User = require("../models/User");
const Account = require("../models/Account");
const Kyc = require("../models/Kyc");
const Portfolio = require("../models/Portfolio");
const Transaction = require("../models/Transaction");
const Order = require("../models/order");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById({ _id: userId }).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("user", user);
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};
exports.addFund = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0)
      return res.status(400).json({ message: "Invalid Amount" });
    const account = await Account.findOne({ user: userId });
    if (!account) {
      return res.status(404).json({ message: "Accout Not found" });
    }
    account.walletBalance = (account.walletBalance || 0) + amt;
    await account.save();
    res
      .status(200)
      .json({ message: "Funds added", walletBalance: account.walletBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};
exports.getAccountDetail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const account = await Account.findOne({ user: userId }).select(
      "clientId boId dpId dpType accountType  walletBalance blockedAmount"
    );
    res.status(200).json({ account });
  } catch (error) {
    console.error(error);
    res.status(500).josn({ message: "server error" });
  }
};
exports.getKyc = async (req, res) => {
  try {
    const userId = req.user.userId;
    const kyc = await Kyc.findOne({ user: userId }).select(
      "panNum aadhaarNum dob"
    );
    if (!kyc) {
      return res.status(404).josn({ message: "Kyc not found" });
    }
    res.status(200).json({ kyc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};
exports.deleteAccount = async (req, res) => {
  console.log("hyy11");
  try {
    console.log("hyy");
    const userId = req.user.userId;
    const holdings = await Portfolio.findOne({ userId, quantity: { $gt: 0 } });
    console.log("holdings", holdings);
    if (holdings) {
      return res
        .status(400)
        .json({ message: "Holding exist.Clear all holdings first" });
    }
    await Portfolio.deleteMany({ userId });
    await Transaction.deleteMany({ userId });
    await Account.deleteMany({ user: userId });
    await Kyc.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);
    await Order.deleteMany({ userId });
    res.status(200).json({ message: "Account deleted successfully " });
  } catch (error) {
    console.log("hyycc");
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
};
