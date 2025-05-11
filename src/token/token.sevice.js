import jwt from 'jsonwebtoken';
import { Token } from './token.model.js';
import dotenvConfig from '../dotenvConfig.js';
import { HttpError } from '../helpers/HttpError.js';

const { KEY_ACCESS, KEY_REFRESH } = dotenvConfig;

const generateTokens = payload => {
  if (!KEY_ACCESS || !KEY_REFRESH) {
    throw new Error('JWT secret keys are not set in environment variables');
  }

  const accessToken = jwt.sign(payload, KEY_ACCESS, {
    expiresIn: '3d',
  });

  const refreshToken = jwt.sign(payload, KEY_REFRESH, {
    expiresIn: '30d',
  });

  return {
    accessToken,
    refreshToken,
  };
};

const saveToken = async (userId, refreshToken) => {
  try {
    const tokenData = await Token.findOne({ user: userId });

    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }

    const token = await Token.create({
      user: userId,
      refreshToken,
    });

    return token;
  } catch (err) {
    throw HttpError(500, 'Error saving token to database');
  }
};

const removeToken = async refreshToken => {
  return Token.deleteOne({ refreshToken });
};

const validateAccessToken = token => {
  try {
    return jwt.verify(token, KEY_ACCESS);
  } catch (err) {
    throw HttpError(401, 'Invalid access token');
  }
};

const validateRefreshToken = token => {
  try {
    return jwt.verify(token, KEY_REFRESH);
  } catch (err) {
    throw HttpError(401, 'Invalid refresh token');
  }
};

const findToken = async refreshToken => {
  return Token.findOne({ refreshToken });
};

export default {
  generateTokens,
  saveToken,
  removeToken,
  validateAccessToken,
  validateRefreshToken,
  findToken,
};
