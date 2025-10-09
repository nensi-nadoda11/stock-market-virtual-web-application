const mongoose=require('mongoose')

const accountSchema=new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  clientId:{
    type:String,
    required:true,
    unique:true
  },
  boId:{
    type:String,
    required:true,
    unique:true
  },
  dpId:{
    type:String,
    required:true,
  },
  dpType:{
    type:String,
    enum:["CDSL","NSDL"],
    required:true
  },
  accountType:{
    type:String,
    default:'DEMAT'
  },
  walletBalance:{
    type:Number,
    default:100000
  },
  blockedAmount:{
    type:Number,
    default:0
  },
  accountOpeningDate:{
    type:Date,
    default: Date.now
  }
})
module.exports=mongoose.model("Account",accountSchema)