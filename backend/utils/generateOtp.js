const generateOtp = (len = 6) => {
  return Math.floor(Math.random() * 10 ** len).toString().padStart(len, "0");
};

module.exports = generateOtp;
