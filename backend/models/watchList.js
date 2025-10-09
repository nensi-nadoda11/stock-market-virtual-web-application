const mongoose=require('mongoose')

const watchListSchema=new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  stockSymbol:{type:String,required:true},
  currentPrice:{type:Number,required:true},
  previousPrice:{type:Number,default:null},
},{timestamps:true})

watchListSchema.index({userId:1,stockSymbol:1},{unique:true})

module.exports= mongoose.models.Watchlist || mongoose.model("Watchlist", watchListSchema);
