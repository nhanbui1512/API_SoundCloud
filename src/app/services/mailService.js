require('dotenv').config();

const nodemailer = require('nodemailer');

// Cấu hình transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // hoặc 'yahoo', 'outlook', ...
  auth: {
    user: process.env.EMAIL, // Email của bạn
    pass: process.env.PASSWORD_EMAIL, // Mật khẩu ứng dụng (application-specific password)
  },
});

// // Cấu hình email
// const mailOptions = {
//   from: 'your-email@gmail.com', // Địa chỉ email người gửi
//   to: 'recipient-email@gmail.com', // Địa chỉ email người nhận
//   subject: 'Test Email', // Chủ đề của email
//   text: 'This is a test email sent using Node.js and Nodemailer!', // Nội dung của email
// };

// Gửi email
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     return console.log(error);
//   }
//   console.log('Email sent: ' + info.response);
// });

module.exports = transporter;
