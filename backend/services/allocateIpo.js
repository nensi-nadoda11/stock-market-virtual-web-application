const Ipo=require('../models/Ipo')
const IpoApplication=require('../models/IpoApplication')
const Account=require('../models/Account')
const mongoose=require('mongoose')

async function processAllocation(ipoId){
  try{
    const ipo=await Ipo.findById(ipoId)
    console.log("status",ipo.status)

    if(!ipo)
      throw new Error("IPO not found")
    if(ipo.status=="closed")
      return {success:false,message:"IPO already allotted"}

    if(new Date() < new Date(ipo.offerEndDate))
      return {success:false,message:"IPO still open"}

    const apps=await IpoApplication.find({ipoId:ipo._id,status:"pending"})
    console.log("ipoapplication",apps)
    if(!apps || apps.length==0)
    {
      ipo.status="allotted",
      await ipo.save()
      return {success:true,message:"no application"}
    }
    const totalRequested=apps.reduce((s,a)=>s + a.sharesRequested,0)
    let remainingShares=ipo.totalOfferShares || 0

    const applicants=apps.map(a=>({
     // appId:a._id,
      id:a._id,
      userId:a.userId.toString(),
      sharesRequested:a.sharesRequested,
      lotsApplied:a.lotsApplied,
      amountBlocked:a.amountBlocked,
       allottedShares: 0
    }))
    if(totalRequested<=remainingShares){
      for(const rec of applicants)
      {
        rec.allottedShares=rec.sharesRequested
      }
      remainingShares-=totalRequested
    }
    else
    {
      for(const rec of applicants)
      {
        const prop=Math.floor((rec.sharesRequested * remainingShares)/totalRequested)
        const lotMultiple=ipo.lotSize
        rec.allottedShares=Math.floor(prop/lotMultiple)* lotMultiple
      }
      let used=applicants.reduce((s,r)=>s+r.allottedShares,0)
      let leftover=remainingShares -used;

      const eligible=applicants.filter(a=>a.sharesRequested > a.allottedShares)

      for(let i=eligible.length -1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1))
        [eligible[i],eligible[j]]=[eligible[j],eligible[i]]
      }
      let idx=0
      while(leftover >= ipo.lotSize && eligible.length >0)
      {
          const cand=eligible[idx % eligible.length]

          const canTake=cand.sharesRequested-cand.allottedShares
          if(canTake >= ipo.lotSize){
            cand.allottedShares += ipo.lotSize
            leftover-=ipo.lotSize
          }
          idx++;
          if(idx > eligible.length * 10)
            break
      }
    }
    for(const rec of applicants){
      const app=await IpoApplication.findById(rec.id)
      console.log("appp",app)
      if(!app) continue;
      const allotted=rec.allottedShares
      app.allottedShares=allotted
      app.processedAt=new Date()
      if(allotted== rec.sharesRequested){
        app.status="allotted"
        app.refundedAmount=0
      }else if(allotted==0){
        app.status="rejected"
        app.refundedAmount=rec.amountBlocked
      }else
      {
        app.status="partially_allotted"
        const usedAmount=allotted * ipo.pricePerShare
        const refund=rec.amountBlocked-usedAmount
        app.refundedAmount=refund

      }
      await app.save()

      const account=await Account.findOne({userId:mongoose.Types.ObjectId(rec.userId)})
      if(!account) continue
      const usedAmount=allotted * ipo.pricePerShare
      const refundedAmount=rec.amountBlocked-usedAmount

      account.blockedAmount=Math.max(0,account.blockedAmount-rec.amountBlocked)

      if(refundedAmount >0)
      {
        account.walletBalance=Number((account.walletBalance  + refundedAmount).toFixed(2))
      }
      await account.save()
    }
    ipo.status="allotted"
    await ipo.save()
    return {success:true,message:"Allocation Processed"}
  }
  catch(error)
  {
    console.error("processAllocation error:",error.message|| error)
    return {success:false,error:error.message || String(error)}
  }
}
module.exports={processAllocation}