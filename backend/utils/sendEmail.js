const nodemailer=require("nodemailer")
const config=require('../config/config')

const sendEmailOtp=async(to,otp)=>{
   if (!to || typeof to !== "string") {
    console.error(" Invalid email address:", to);
    return;
  }

   const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:config.mail_user,
      pass:config.mail_pass
    },
     tls: {
    rejectUnauthorized: false, 
  },
   })
  await transporter.sendMail({
    from:config.mail_user,
    to,
    subject:"your otp code",
    html:`<h2>your otp is <span style="color:blue">${otp}</span><h2>`
   })
    
}
module.exports=sendEmailOtp