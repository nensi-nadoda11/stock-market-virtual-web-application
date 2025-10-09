require('dotenv').config({path:__dirname+'/../.env'})

const _config={
  port:process.env.PORT,
  mongo_uri:process.env.MONGO_URI,
  mail_user:process.env.EMAIL_USER,
  mail_pass:process.env.EMAIL_PASS,
  sid:process.env.TWILIO_SID,
  auth_token:process.env.TWILIO_auth_token,
  mno:process.env.TWILIO_MOBILE_NO,
   jwtExpire: process.env.JWT_EXPIRE,
  //api_key:process.env.API_KEY,
  Jwtsecret:process.env.JWT_SECRET,
  ipo_api_url:process.env.IPO_API_URL,
  ipo_api_key:process.env.ipo_api_key
}
const config=Object.freeze(_config)
module.exports=config