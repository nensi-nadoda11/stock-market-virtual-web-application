const mongoose=require('mongoose')

const kycSchema=new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  panNum:{
    type:String,
    required:true
  },
  aadhaarNum:{
    type:String,
    required:true
  },
  dob:{
    type:Date,
    required:true
  },
  panImageUrl:{
    type:String,
    required:true
  },
  aadhaarImageUrl:{
    type:String,
    required:true
  },
  isVerified: { type: Boolean, default: false }
},{ timestamps: true })
module.exports=mongoose.model("Kyc",kycSchema)