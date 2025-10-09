const express=require('express')
const router=express.Router()
const {listIpos,getIpo,applyIpo,fetchIpoFromExternal,getApplication}=require('../controllers/ipoController')
const {processAllocation}=require('../services/allocateIpo')
const auth=require('../middleware/auth')
const IpoApplication = require('../models/IpoApplication')


router.get("/",listIpos)

router.get("/:id",auth,getIpo)

router.post("/fetch",auth,fetchIpoFromExternal)

router.post("/:id/apply",auth,applyIpo)

router.post("/:id/allocate",auth,async(req,res)=>{
  const result=await processAllocation(req.params.id)
  if(result.success) return res.status(200).json({success:true,message:result.message})
  console.log(result)
  return res.status(500).json({success:false,error:result.error})
})

router.get('/ipoApplication/:userId',auth,getApplication)
module.exports=router


