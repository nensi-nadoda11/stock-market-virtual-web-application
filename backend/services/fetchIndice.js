const yahooFinance=require('yahoo-finance2').default
const Indice=require('../models/Indices')

if(yahooFinance && yahooFinance.suppressNotices){
  yahooFinance.suppressNotices(["yahooSurvey"])
}

const indiceSymbol=["^NSEI","^BSESN"]

async function fetchIndice(){
  try{
    const result=await yahooFinance.quote(indiceSymbol)

    for(const i of result)
    {
      const ixData={
        symbol:i.symbol,
        name:i.shortName || i.longName || i.symbol,
        currentPrice:i.regularMarketPrice ?? 0,
        change:i.regularMarketChange ?? 0,
        changePercent: i.regularMarketChangePercent ?? 0,
        lastUpdated:new Date()
      }

      await Indice.findOneAndUpdate(
        {symbol:ixData.symbol},
        {$set:ixData},
        {upsert:true,new:true,runValidators:true,setDefaultsOnInsert:true}
      )
    }
    console.log("✅ fetchIndices: indices updated at", new Date().toLocaleTimeString())
  }
  catch (err) {
   console.error("❌ fetchIndices error:", err && err.message ? err.message : err);
  }
}
module.exports=fetchIndice