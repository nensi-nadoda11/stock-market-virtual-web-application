const jwt=require('jsonwebtoken')
const config=require('../config/config')

module.exports=(req,res,next)=>{
  const token=req.header("Authorization")?.split(" ")[1]
   console.log("tokennnn",token)
  if(!token)
    return res.status(401).json({message:"No token,auth denied"})

  try{
    console.log("token,token")
    const decode=jwt.verify(token,config.Jwtsecret)
    console.log("decode",decode)
    req.user=decode
    console.log("req.user",req.user)
    next()
  }
  catch(err)
  {
    console.log(err)
    return res.status(401).json("Token is not valid")

  }
}