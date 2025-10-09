const mongoose = require('mongoose')

const ipoSchema=new mongoose.Schema({
  externalId:{type:String,default:null,unique:true},
  companyName:{type:String,require:true},
  symbol:{type:String,default:null},
  pricePerShare:{type:String,default:null},
  priceRange:{type:String},
  lotSize:{type:Number,require:true},
  minLots:{type:Number,default:1},
  totalOfferShares:{type:Number,default:0},
  offerStartDate:{type:Date,require:true},
  offerEndDate:{type:Date,require:true},
  status:{type:String,enum:["upcoming","open","closed","allotted"],default:"upcoming"},
  meta:{type:mongoose.Schema.Types.Mixed},
  createdAt:{type:Date,default:Date.now}
})
module.exports=mongoose.model("Ipo",ipoSchema)