const PDFDocument = require('pdfkit');
const fs = require('fs');
const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.mail_user,
    pass: config.mail_pass
  }
});

module.exports = async (newAccount, aadhaarName,kyc,user1) => {
  // Create PDF
  try{
  const pdfPath = `./tmp/${newAccount.clientId}.pdf`;
  const doc = new PDFDocument();
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  doc.fontSize(16).text('Welcome to Stock Market Virtual App', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text('Account Details:\n');
  doc.fontSize(12).text(`Full Name: ${aadhaarName.name}`);
  doc.text(`Mobile Number: ${aadhaarName.mobile}`);
  doc.text(`Email: ${user1.email}`);
  doc.text(`Client ID: ${newAccount.clientId}`);
  doc.text(`Depository: ${newAccount.dpType}`);
  doc.text(`DP ID: ${newAccount.dpId}`);
  doc.text(`BO ID: ${newAccount.boId}`);
  doc.text(`Aadhaar Verified: ${kyc.isVerified}`);
  
  doc.end();

  // Send email after PDF is saved
  writeStream.on('finish', async () => {
    try {
      const info=await transporter.sendMail({
        from: config.mail_user,
        to: user1.email,
        subject: 'Your Client ID and Account Details',
        text: `Hi ${aadhaarName.name}, your account is active. Client ID: ${user1.clientId}`,
        attachments: [
          {
            filename: 'AccountDetails.pdf',
            path: pdfPath
          }
        ]
      });

      // Delete temp PDF
      fs.unlinkSync(pdfPath);

          console.log('PDF sent to:', user1.email);
        

    } catch (error) {
      console.error('Failed to send email:', error);
      return 'failed'
    }
  
 
  });


  // Handle errors in writing stream
  writeStream.on('error', (err) => {
    console.error('PDF Write Error:', err);
  });
}
 catch(err)
  {
     console.log(err)
  }
};
