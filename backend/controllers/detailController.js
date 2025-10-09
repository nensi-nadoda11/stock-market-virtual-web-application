
const Account = require('../models/Account')


const detail=async(req,res)=>{
   try{
  const {userId}=req.body
  console.log("userId",userId)

  const account=await Account.findOne({user:userId})

  if(!account)
    res.json({message:"Account doesn't exists"})
   
  //res.json({message:"hello"})
 
  res.json({boId:account.boId,
              dpId:account.dpId,
             dpType:account.dpType,
             clientId:account.clientId
             })
    
  }
  catch(err){
    console.log(err)
    res.json({message:"Error fetching account details"})
  }
  

}
module.exports=detail