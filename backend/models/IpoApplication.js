const mongoose=require("mongoose")

const ipoApplicationSchema=new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",require:true},
  ipoId:{type:mongoose.Schema.Types.ObjectId,ref:"Ipo",require:true},
  lotsApplied:{type:Number,required:true},
  sharesRequested:{type:Number,require:true},
  amountBlocked:{type:Number,require:true},
  status:{type:String,enum:["pending","allotted","rejected","partially_allotted","refunded"]},
  allottedShares:{type:Number,default:0},
  refundedAmount:{type:Number,default:0},
  appliedAt:{type:Date,default:Date.now},
  processedAt:{type:Date}
})
module.exports=mongoose.model("IpoApplication",ipoApplicationSchema)