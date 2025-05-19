import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export class AuthEmailService {
  async sendVerificationCodeEmail(email, code) {
    const mailOptions = {
      from: '"My App" <no-reply@example.com>',
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is ${code}`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.messageId);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }
}
