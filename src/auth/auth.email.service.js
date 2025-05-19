import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, //only for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export class AuthEmailService {
  async sendVerificationCodeEmail(email, code) {
    const mailOptions = {
      from: '"Lastivka" <no-reply@example.com>',
      to: email,
      subject: '🎉 Thank You for Registering at Lastivka!',
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #4CAF50;">Welcome to Lastivka!</h2>
        <p>Thank you for registering. We're excited to have you on board.</p>
        <p>Your verification code is:</p>
        <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #333;">${code}</div>
        <p>Please enter this code in the app to complete your registration.</p>
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #999;">If you didn't request this, you can ignore this email.</p>
      </div>
    </div>
  `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.messageId);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }
}
