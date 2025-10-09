const cloudinary=require('cloudinary')

cloudinary.config({
  cloud_name:process.env.CLOUD_NM,
  api_key:process.env.CLOUD_API,
  api_secret:process.env.CLOUD_SECRET
})
module.exports=cloudinary