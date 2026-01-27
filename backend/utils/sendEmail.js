import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Dùng SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"HanHan Bakery" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Thêm await để bắt lỗi nếu gửi thất bại
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email đã gửi: " + info.response);
  } catch (error) {
    console.error("❌ Lỗi Nodemailer:", error);
    throw error; // Quăng lỗi để controller bắt được
  }
};

export default sendEmail;