require("dotenv").config();
const mongoose = require("mongoose");
const Aadhaar = require("./models/aadhharData");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Aadhaar.deleteMany();
  await Aadhaar.insertMany([
    { aadhaar: "123456789012", mobile: "8160364032", name: "Nensi Nadoda" },
    { aadhaar: "222222333333", mobile: "8160364032", name: "Krupali Chauhan" },
    { aadhaar: "777666555444", mobile: "8160364032", name: "Mansi Asodariya" }
  ]);
  console.log(" Demo Aadhaar records inserted");
  process.exit();
});
