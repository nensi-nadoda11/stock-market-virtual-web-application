const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Otp = require("../models/Otp");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const sendSms = require("../utils/sendSms");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const Account = require("../models/Account");

const register = async (req, res) => {
  try {
    const { name, email, dob, mobile, password, confirmPassword } = req.body;

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters, include uppercase, lowercase and a special character",
      });
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const today = new Date();
    const dobDate = new Date(dob);

    const age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    const dayDiff = today.getDate() - dobDate.getDate();

    const exactAge =
      monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (exactAge < 18) {
      return res
        .status(400)
        .json({ message: "You must be at least 18 years old to register." });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ message: "Email already in use" });

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await Otp.create({
      identifier: email,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });
    let emailStatus = "pending";
    let smsStatus = "pending";

    try {
      await sendEmail(email, otp);
      emailStatus = "sent";
    } catch (error) {
      console.log("Email otp failed:", error.message);
      emailStatus = "failed";
    }

    try {
      await sendSms(mobile, otp);
      smsStatus = "sent";
    } catch (error) {
      console.log("SMS otp failed:", error.message);
      smsStatus = "failed";
    }

    return res.status(200).json({
      message: "Registration  completed",
      emailStatus,
      smsStatus,
      note: "please verify otp to complete registration",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
};
const verifyOtp = async (req, res) => {
  try {
    const { name, email, mobile, dob, password, otp } = req.body;

    console.log(email);

    const otpDoc = await Otp.findOne({ identifier: email });
    if (!otpDoc)
      return res.status(400).json({ msg: "OTP expired or not found" });

    const isMatch = await bcrypt.compare(otp, otpDoc.otpHash);
    console.log("isMatch:", isMatch);
    if (!isMatch) return res.status(400).json({ msg: "Invalid OTP" });

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      mobile,
      dob,
      password: hashPassword,
    });
    console.log(newUser);

    await Otp.deleteMany({ identifier: email });
    console.log("hyy");
    const payload = { userId: newUser._id, email: newUser.email };
    console.log(payload);
    const token = jwt.sign(payload, config.Jwtsecret, {
      expiresIn: config.jwtExpire,
    });
    console.log(token);

    return res.status(200).json({
      msg: "OTP verified & user registered",
      token,
      user: newUser,
    });
  } catch (err) {
    console.error("OTP verify error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
const loginVerifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  console.log(email);
  try {
    const otpDoc = await Otp.findOne({ identifier: email });
    if (!otpDoc)
      return res.status(400).json({ msg: "OTP expired or not found" });
    console.log(await bcrypt.hash(otp, 10));
    console.log("otpDoc", otpDoc.otpHash);
    const isMatch = await bcrypt.compare(otp, otpDoc.otpHash);

    console.log("isMatch:", isMatch);
    if (!isMatch) return res.status(400).json({ msg: "Invalid OTP" });

    const newUser = await User.findOne({ email });

    console.log(newUser);

    await Otp.deleteMany({ identifier: email });
    console.log("hyy");
    const payload = { userId: newUser._id, email: newUser.email };
    console.log(payload);
    const token = jwt.sign(payload, config.Jwtsecret, {
      expiresIn: config.jwtExpire,
    });
    console.log(token);
    const userId = await User.findOne({ email });
    const account = await Account.findOne({ user: userId._id });
    console.log("dp type", account.dpType);
    const dpId = account.dpId;
    const dpType = account.dpType;

    return res.status(200).json({
      msg: "OTP verified & user logged In",
      token,
      user: newUser,
      dpId,
      dpType,
    });
  } catch (err) {
    console.error("OTP verify error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
const resendOtp = async (req, res) => {
  try {
    const { email, mobile } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({ message: "Email or MobileNo required" });
    }

    const otpCode = generateOtp();
    const otpHash = await bcrypt.hash(otpCode, 10);

    await Otp.deleteMany({ identifier: email });
    await Otp.create({
      identifier: email,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

    //  await Otp.findOneAndUpdate({
    //     identifier: email,
    //    otpHash,
    //    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    //})
    let emailStatus = "pending";
    let smsStatus = "pending";

    try {
      await sendEmail(email, otpCode);
      emailStatus = "sent";
    } catch (error) {
      console.log("Email otp failed:", error.message);
      emailStatus = "failed";
    }

    try {
      await sendSms(mobile, otpCode);
      smsStatus = "sent";
    } catch (error) {
      console.log("SMS otp failed:", error.message);
      smsStatus = "failed";
    }

    return res.status(200).json({
      message: "Registration  completed",
      emailStatus,
      smsStatus,
      note: "please verify otp to complete registration",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("password", password);
    const checkValue = await User.findOne({ email });
    console.log("check value", checkValue);
    if (!checkValue) res.status(404).json({ message: "Email is Wrong" });

    const truePassword = await bcrypt.compare(password, checkValue.password);
    if (email == checkValue.email && truePassword) {
      const otp = generateOtp();
      const otpHash = await bcrypt.hash(otp, 10);
      await Otp.deleteMany({ identifier: email });
      await Otp.create({
        identifier: email,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      });

      let emailStatus = "pending";
      let smsStatus = "pending";

      try {
        await sendEmail(email, otp);
        emailStatus = "sent";
      } catch (error) {
        console.log("Email otp failed:", error.message);
        emailStatus = "failed";
      }

      try {
        await sendSms(mobile, otp);
        smsStatus = "sent";
      } catch (error) {
        console.log("SMS otp failed:", error.message);
        smsStatus = "failed";
      }

      return res.status(200).json({
        message: "sent Otp To your Mobile Number or Email",
        emailStatus,
        smsStatus,
      });
    } else {
      res.status(400).json({ message: "Your Password is Wrong" });
    }
  } catch (error) {
    console.log(error);
    res.json({ message: "something went wrong.." });
  }
};

module.exports = { register, verifyOtp, resendOtp, login, loginVerifyOtp };
