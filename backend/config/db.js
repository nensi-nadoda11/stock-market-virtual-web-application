const mongoose = require("mongoose");
const config=require('../config/config')
const connectDb = async () => {
  try {
    await mongoose.connect(config.mongo_uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed", err.message);
    process.exit(1);
  }
};
module.exports=connectDb