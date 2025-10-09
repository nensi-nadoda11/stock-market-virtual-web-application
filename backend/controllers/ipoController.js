const Ipo=require('../models/Ipo')
const IpoApplication=require('../models/IpoApplication')
const Account=require('../models/Account')
const fetchAndStoresIpo=require('../services/fetchIpo')
const mongoose=require('mongoose')

const listIpos=async(req,res)=>{
  try{
    const ipos=await Ipo.find().sort({offerStartDate:-1})
    return res.status(200).json({success:true,data:ipos})
  }
  catch(error)
  {
     console.error("listIpo error :",error.message)
     return res.status(500).json({success:false,message:"failed to list ipo"})
  }
}
const getIpo=async(req,res)=>{
  try{
    const ipo=await Ipo.findById(req.params.id)
    if(!ipo) return res.status(404).json({success:false,message:"IPO not found"})
    return res.status(200).json({success:true,data:ipo})
  }
  catch(error)
  {
    console.error("getIpo error:",error.message)
    return res.status(500).json({success:false,message:"failed to get ipo"})
  }
}
const fetchIpoFromExternal=async(req,res)=>{
  const result=await fetchAndStoresIpo()
  if(result.success)
    return res.status(200).json({success:true,message:result.message})
  return res.status(500).json({success:false,message:result.error})
}
const applyIpo=async(req,res)=>{
  try{
     const {userId,ipoId,lots}=req.body
     if(!userId || !ipoId || !lots || lots<=0)
      return res.status(400).json({success:false,message:"invalid parameter"})
    
     const ipo=await Ipo.findById(ipoId)
     if(!ipo)
      return res.status(404).json({success:false,message:"Ipo not found"})

     const now=new Date()
     if(now < new Date(ipo.offerStartDate) || now > new Date(ipo.offerEndDate) || ipo.  status!=="open")
     {
         return res.status(400).json({success:false,message:"Ipo is not open for application"})
     }

     const sharesRequested=lots * ipo.lotSize
     const amount=sharesRequested * ipo.pricePerShare

     const account=await Account.findOne({user:userId})
     if(!account)
      return res.status(404).json({success:false,message:"Account Not Found"})
    if(account.walletBalance < amount)
      return res.status(400).json({success:false,message:"Insufficient Wallet balance"})

    account.walletBalance=Number((account.walletBalance-amount).toFixed(2))
    account.blockedAmount=Number((account.blockedAmount+amount).toFixed(2))

    await account.save()

    //create application
    const app=await IpoApplication.create({
      userId:new mongoose.Types.ObjectId(userId),
      ipoId:ipo._id,
      lotsApplied:lots,
      sharesRequested,
      amountBlocked:amount,
      status:"pending"
    })
    return res.status(201).json({success:true,message:"IPO application created",data:app,remainingBalance:account.walletBalance})

  }
  catch(err)
  {
     console.error("applyipo error:",err.message)
     return res.status(500).json({success:false,message:"Failed to apply ipo"})
  }
}
const getApplication=async(req,res)=>{
    try{
      console.log("application fetched")
      const app=await IpoApplication.find({userId:req.params.userId}).populate('ipoId')
      res.status(200).json({success:true,data:app})
      console.log("ipo appplication",app)
    }
    catch(error)
    {
      res.status(500).json({success:false,data:error.message})
    }
}
module.exports={listIpos,getIpo,applyIpo,fetchIpoFromExternal,getApplication}