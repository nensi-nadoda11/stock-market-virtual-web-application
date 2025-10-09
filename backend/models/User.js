const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {type:String,require},
  email: { type: String, unique: true ,require},
  dob: {type:Date,require},
  mobile: { type: String, require },
  password: String,
  createdAt:{type:Date,default:Date.now}}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
