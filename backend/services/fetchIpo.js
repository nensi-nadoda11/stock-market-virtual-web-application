const axios=require('axios')
const Ipo=require('../models/Ipo')
const config=require('../config/config')

const ipo_url=config.ipo_api_url
const ipo_key=config.ipo_api_key

async function fetchAndStoresIpo(){
  try{
     let ipos=[]
      console.log("ipo_url",ipo_url)
     if(ipo_url)
     {
       const openres= await axios.get(`${ipo_url}?status=open`,{
        headers:{
      //"x-api-key":ipo_key
              "Authorization":`Bearer ${ipo_key}`
        },
        timeout:10000
       });

       const upcomingres=await axios.get(`${ipo_url}?status=upcoming`,{
        headers:{
          //'x-api-key':ipo_key
            "Authorization":`Bearer ${ipo_key}`},
        timeout:10000
       })


//     console.log("Raw API Response:", ipos.data); // debug ke liye

    const  openIpo = openres.data.ipos || openres.data.data ||openres.data|| [];
    const upcomingIpo=upcomingres.data.ipos || upcomingres.data.data || upcomingres.data || []

    ipos=[...openIpo,...upcomingIpo]

   // console.log("Processed IPO Result:", result);

    if (!ipos || ipos.length === 0) {
      console.warn("⚠️ No IPOs found, using fallback...");
      return;
     }
     
    }
      // Fallback mock if external didn't provide data
     if(!ipos || ipos.length == 0)
     {
      ipos=[
        {
           externalId: "mock-1",
          companyName: "Rachit Prints Ltd",
          pricePerShare: 55,
          priceRange: "50 - 55",
          lotSize: 50,
          totalOfferShares: 200000,
          offerStartDate: new Date(Date.now() + 0), // open now for testing
          offerEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        },
         {
          externalId: "mock-2",
          companyName: "Amanta Healthcare Ltd",
          pricePerShare: 130,
          priceRange: "120 - 135",
          lotSize: 100,
          totalOfferShares: 300000,
          offerStartDate: new Date(Date.now() + 0),
          offerEndDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
        }
      ]
     }
     for(const item of ipos){
      const filter=item.id
      ?{externalId:item.id}
      :{companyName:item.name,offerStartDate:item.startDate}

      const doc={
        externalId:item.id || null,
        companyName:item.name,
        symbol:item.symbol||null,
         pricePerShare: Number(item.pricePerShare || (item.priceRange ? Number(item.priceRange.split("-").pop().trim()) : 0)),
        priceRange: item.priceRange || null,
        lotSize: Number(item.lotSize || item.minQty || 1),
        minLots: item.minLots || 1,
        totalOfferShares: Number(item.totalOfferShares || item.totalOfferShares || 0),
        offerStartDate: item.startDate ? new Date(item.startDate) : new Date(),
        offerEndDate: item.endDate ? new Date(item.endDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: (new Date() >= new Date(item.startDate) && new Date() <= new Date(item.endDate)) ? "open" : (new Date() > new Date(item.endDate) ? "closed" : "upcoming"),
        meta: item

      }
      await Ipo.findOneAndUpdate(filter,{$set:doc},{upsert:true,new:true})
     }
     console.log("✅ fetchIpos: IPOs fetched & stored.")
     return {success:true,message:"IPO fetched & stored"}
  }catch(error)
  {
    console.error("❌ fetchIpos error:", error.message)
    return {success:false,error:error.message || String(error)}

  }
}
module.exports=fetchAndStoresIpo