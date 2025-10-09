const express=require('express')
const router=express.Router()
const {submitKyc,verifyOtpAndSave, resendOtp}=require('../controllers/kycController')
const auth=require('../middleware/auth')
const detail = require('../controllers/detailController')
 
//router.use(fileUpload({useTempFiles:true}))
router.post(
  "/kyc-submit",
  auth,
  submitKyc
)
router.post("/kyc-verify",auth,verifyOtpAndSave)
router.post('/user-kyc-detail',detail)
router.post('/kyc-resend',resendOtp)
module.exports=router