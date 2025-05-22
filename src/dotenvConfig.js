import dotenv from 'dotenv';
dotenv.config();

export default {
  MONGO_CONNECT: process.env.MONGO_CONNECT,
  PORT: process.env.PORT,

  KEY_ACCESS: process.env.KEY_ACCESS,
  KEY_REFRESH: process.env.KEY_REFRESH,

  CLOUDINARY_ClOUD_NAME: process.env.CLOUDINARY_ClOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_SECRET_KEY: process.env.CLOUDINARY_SECRET_KEY,

  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  AVATAR_WIDTH: parseInt(process.env.AVATAR_WIDTH || '68', 10),
  AVATAR_HEIGHT: parseInt(process.env.AVATAR_HEIGHT || '68', 10),
};
