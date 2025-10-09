const express = require("express");
const router = express.Router();
const { register, verifyOtp ,resendOtp, login,loginVerifyOtp} = require("../controllers/authController");

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post('/resend-otp',resendOtp)
router.post('/login',login)
router.post('/login-otp-verify',loginVerifyOtp)

module.exports = router;
