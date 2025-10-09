const mongoose =require ('mongoose')
const Stock =require( '../models/Stock.js')
const corn =require( 'node-cron')
require("dotenv").config();
const yahooFinance=require("yahoo-finance2").default

mongoose.connect(process.env.MONGO_URI)

const rowSymbols=[
   "TCS.NS","INFY.NS","WIPRO.NS","HDFCBANK.NS","ICICBANK.NS","SBIN.NS","ONGC.NS",
   "ADANIGREEN.NS","HINDUNILVR.NS","ITC.NS","NESTLEIND.NS","TATAMOTORS.NS","MARUTI.NS","M_M.NS",
   "SUNPHARMA.NS","CIPLA.NS","BHARTIARTL.NS","IDEA.NS","RELIANCE.NS","TATASTEEL.NS","JSWSTEEL.NS","HINDALCO.NS","ULTRACEMCO.NS","SHREECEM.NS","ACC.NS","ASIANPAINT.NS","BAJFINANCE.NS"
]
   
const stockSymbol=[...new Set(rowSymbols)]

async function fetchSectorIfMissing(symbol){
   try{
       const sum=await yahooFinance.quoteSummary(symbol,{modules:["assetProfile"]})
       return sum?.assetProfile?.sector || "Unknown"
   }
   catch(error){
      return "Unknown"
   }
}
async function fetchStockData() {
   try{
   //   const url=`http://query1.finance.yahoo.com/v7/finance/quote?symbols=${stockSymbol.join(",")}`
     // const res=await axios.get(url)

      //const stocks=res.data.quoteResponse.result
       const result=await yahooFinance.quote(stockSymbol)

       for (const s of result){
         let sector=s.sector || "Unknown"
         if(!sector)
         {
            sector=await fetchSectorIfMissing(s.symbol)
         }
      
       
      //for(let s of result)
      //{
         const stockData={
            symbol:s.symbol ,
            name:s.longName || s.shortName,
           // sector:s.sector || "Unknown",
            sector,
            exchange:s.symbol.endsWith(".NS") ? "NSE" : "BSE",
            currentPrice:s.regularMarketPrice || 0,
            marketCap:s.marketCap || null,
            peRatio : s.trailingPE || null,
            dividendYield: s.trailingAnnualDividendYield || null,
            week52High: s.fiftyTwoWeekHigh || null,
            week52Low: s.fiftyTwoWeekLow || null,
            volume: s.regularMarketVolume || null,
            lastUpdated: new Date()
          
            
         }
          await Stock.findOneAndUpdate(
            {symbol:stockData.symbol},
           { $set:stockData},
            {upsert:true ,new :true,runValidators:true,setDefaultsOnInsert:true}
          )
      }
      console.log("✅ Stocks Updated : ",new Date().toLocaleTimeString())
   }
   catch(error)
   {
      console.log("❌  Error fetching stocks",error.message)
   }
}
//corn.schedule("*/1 9-15 * * 1-5",()=>{
//   fetchStockData()
//})
module.exports=fetchStockData