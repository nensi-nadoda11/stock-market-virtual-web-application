const Kyc=require('../models/Kyc')
const Aadhardata=require('../models/aadhharData')
const bcrypt=require('bcryptjs')
const generateOtp=require('../utils/generateOtp')
const cloudinary=require('../utils/cloudinary')
const  Otp=require('../models/Otp')

const Account=require('../models/Account')
const { generateClientId, generateBoId } = require('../utils/generateId')
const aadhharData = require('../models/aadhharData')
const generatePdf = require('../utils/generatePdf')
const User=require('../models/User')
const sendOtp=require('../utils/sendSms')
const sendEmail = require("../utils/sendEmail");


const submitKyc=async(req,res)=>{
   try{
    const {panNum,aadhaarNum,dob}=req.body;
  const aadhaar=aadhaarNum
    const userId=req.user.userId
    
  //   const aadhaarImage=req.files?.aadhaarImage
    //  const panImage=req.files?.panImage
      //if (!aadhaarImage || !panImage) {
  //return res.status(400).json({ message: "Both images are required." });
//}
  //  const maxSize=500*1024
  //  if(
  //    aadhaarImage.size>maxSize || panImage.size>maxSize
  //  ){return res.status(400.).json({message:"Image size must be less than 50kb"})}
    const panNumber=await Kyc.findOne({panNum})
    if(panNumber)
      res.status(400).json({message:"PanNumber Already Exist"})
    const aadhaarNumber=await Kyc.findOne({aadhaar})
    if(aadhaarNumber)
      res.status(400).json({message:"Aadhaar Number already exist"})

    const aadhaarDoc=await Aadhardata.findOne({aadhaar})
    if(!aadhaarDoc)
      return res.status(400).json({message:"Aadhaar number is not valid"})

    const identifier=aadhaarDoc.mobile
    const otp=generateOtp()
    const hashedOtp=await bcrypt.hash(otp,10)
    await Otp.deleteMany({identifier})
    await Otp.findOneAndUpdate(
      {identifier},
      {otpHash:hashedOtp},
      {upsert:true,new:true}
    )
   //  await Otp.deleteMany({identifier})
   //  await Otp.create({
   //       identifier,
   //       otpHash:hashedOtp,
   //       expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
   //     });
     let emailStatus="pending"
        let smsStatus='pending'

        //try{
        //  await sendEmail(identifier,otp)
        //  emailStatus="sent"
//
        //}
        //catch(error){
        //  console.log("Email otp failed:",error.message)
        //  emailStatus="failed"
        //}
        
        try{
          await sendOtp(identifier,otp)
          smsStatus="sent"

        }
        catch(error){
          console.log("SMS otp failed:",error.message)
          smsStatus="failed"
        }
    
        
    //await sendOtp(identifier, otp);
    //await sendEmail(identifier,otp)

    return res.status(200).json({message:"OTP sent successfully.",identifier})

    

   }

   catch(error)
   {
      console.error("KYC error:",error)
      return res.status(500).json({message:"server error"})  
   }
}
const verifyOtpAndSave=async(req,res)=>{
   try{
      const {otp,aadhaarNum,panNum,dob,userId,dpType}=req.body

      const aadhaarImage=req.files?.aadhaarImage
      const panImage=req.files?.panImage
      console.log("kyc userId:",userId)
      const user=await User.findById({_id:userId})
      console.log(" kyc email:",user.email)
      const otpDoc=await Otp.findOne({identifier:user.mobile})
      console.log("kyc otpdoc",otpDoc)
      if(!otpDoc)
        return res.status(400).json({message:"OTP expired or not found"})
       console.log("kyc otp",otp)
const isMatch = await bcrypt.compare(otp.toString().replace(/,/g, ''), otpDoc.otpHash);      console.log("kyc ismatch",isMatch)
      if(!isMatch)
        return res.status(400).json({message:"Invalid Otp"})

          const panUpload=await cloudinary.uploader.upload(panImage.tempFilePath,{
      folder:"kyc-docs"
    })

    const aadhaarUpload=await cloudinary.uploader.upload(aadhaarImage.tempFilePath,{
      folder:"kyc-docs"
    })

     const kyc=new Kyc({
      user:userId,
      panNum,
      aadhaarNum,
      dob,
      panImageUrl:panUpload.secure_url,
      aadhaarImageUrl:aadhaarUpload.secure_url,
      isVerified:true
 })



    await kyc.save()
    await Otp.deleteMany({identifier:user.email})

    
    const existingAccount=await Account.findOne({user:userId})
    if(!existingAccount)
    {
       const clientId=generateClientId()
       const dpId=dpType=='CDSL' ? '12012300':'303028'
       const boId=generateBoId(dpType,clientId,dpId)

      const newAccount=new Account({
        user:userId,
        clientId,
        boId,
        dpId,
        dpType,
        accountType:'DEMAT',
        walletBalance:100000

       })
       await newAccount.save()
       
        
       const aadhaarName = await aadhharData.findOne({aadhaar:aadhaarNum});
console.log(userId)
        const user1=await User.findOne({_id:userId})
        console.log(user1)

         await generatePdf(newAccount,aadhaarName,kyc,user1)
         
         return res.status(201).json({message:"KYC submitted successfully and email sent"})
     }
    else
    {
      return res.json({message:'User Account already Exist'})
    }


   }
   catch(err)
   {
      console.error("verifyotp and save error",err)
      return res.status(500).json({message:"Internal server error"})
   }
}
const resendOtp=async(req,res)=>{
  try{
    const {userId}=req.body
    console.log("kyc user id",userId)
     const data=await User.findById({_id:userId})
     console.log("kyc data ",data)

     const email=data.email
     console.log("kyc email ",email)
    if(!email)
    { 
      return res.status(400).json({message:"Email"})
    }

    const otpCode=generateOtp()
    console.log("kyc otp",otpCode)
     const otpHash = await bcrypt.hash(otpCode, 10);

     await Otp.deleteMany({identifier:email})
      await Otp.create({
      identifier: email,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    });

  
     let emailStatus="pending"
        let smsStatus='pending'

        try{
          await sendEmail(email,otpCode)
          emailStatus="sent"

        }
        catch(error){
          console.log("Email otp failed:",error.message)
          emailStatus="failed"
        }
        
    
        
         return res.status(200).json({
          message:"Otp resent",
          emailStatus,
          note:"please verify otp to complete KYC"
        })
  }
  catch(err)
  {
       console.log(err)
       return res.status(500).json({message:'Something went wrong'})
  }
}
module.exports={submitKyc,verifyOtpAndSave,resendOtp}