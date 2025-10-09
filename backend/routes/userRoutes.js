const express=require('express')
const router=express.Router()
const auth=require('../middleware/auth')
const {getProfile,addFund,getAccountDetail,getKyc,deleteAccount} =require('../controllers/userController')
router.get("/user",auth,getProfile)
router.post('/wallet/add',auth,addFund)
router.get('/account/details',auth,getAccountDetail)
router.get('/kyc',auth,getKyc)
router.delete('/account/delete',auth,deleteAccount)

module.exports=router