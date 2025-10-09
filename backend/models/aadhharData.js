const mongoose=require('mongoose')

const aadhaarData=new mongoose.Schema({
   name:String,
   aadhaar:String,
   mobile:String
})
module.exports=mongoose.model("Aadhardata",aadhaarData)