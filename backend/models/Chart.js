const mongoose=require('mongoose')

const chartSchema=new mongoose.Schema({
  symbol:{type:String,require:true},
  interval:{type:String,require:true},
  data:[
   { 
    time:Number,
    open:Number,
    close:Number,
    high:Number,
    low:Number,
    volume:Number
   }
  ],
  lastUpdated:{type:Date,default:Date.now}
})
module.exports=mongoose.model("Chart",chartSchema)

