const twilio = require("twilio");
const config = require("../config/config");

const accountsid = config.sid;
const authtoken = config.auth_token;
const mno = config.mno;

console.log(accountsid)

const client = twilio(accountsid, authtoken);

const sendSmsOtp = async (toNumber, otp) => {
  try {
    const formattedNumber = toNumber.startsWith("+91") ? toNumber : `+91${toNumber}`;

    const message = await client.messages.create({
      body: `Your OTP for is ${otp}`,
      from: mno,
      to: formattedNumber,
    });
          console.log("SMS sent, SID:", message.sid);
  } catch (error) {
    console.error("SMS sending failed:", error.message);
    throw new Error("OTP SMS failed");
  }
};

module.exports = sendSmsOtp;
