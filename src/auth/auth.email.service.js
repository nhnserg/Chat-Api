import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export class AuthEmailService {
  async sendVerificationCodeEmail(email, code) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is ${code}`,
    };
    await transporter.sendMail(mailOptions);
  }
}
