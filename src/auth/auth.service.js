import jwt from 'jsonwebtoken';
import { User } from '../user/user.model.js';
import { HttpError } from '../helpers/HttpError.js';
import { Token } from '../token/token.model.js';
import dotenvConfig from '../dotenvConfig.js';

const { KEY_ACCESS, KEY_REFRESH } = dotenvConfig;

export class AuthService {
  async registerUser({ name, email, password }) {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw HttpError(409, 'Email is already in use');
    }

    const newUser = await User.create({ name, email, password });

    const tokens = this.generateTokens(newUser._id);
    await this.saveRefreshToken(newUser._id, tokens.refreshToken);

    return {
      ...newUser.toObject(),
      password: undefined,
      ...tokens,
    };
  }

  async loginUser({ email, password }) {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw HttpError(401, 'Email or password invalid');
    }

    const tokens = this.generateTokens(user._id);
    await this.saveRefreshToken(user._id, tokens.refreshToken);

    return {
      ...user.toObject(),
      password: undefined,
      ...tokens,
    };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw HttpError(401, 'Refresh token is missing');
    }

    const tokenData = await Token.findOne({ refreshToken });

    if (!tokenData) {
      throw HttpError(403, 'Invalid refresh token');
    }

    let userData;
    try {
      userData = jwt.verify(refreshToken, KEY_REFRESH);
    } catch (error) {
      throw HttpError(403, 'Invalid refresh token');
    }

    const user = await User.findById(userData.userId);

    if (!user) {
      throw HttpError(404, 'User not found');
    }

    const tokens = this.generateTokens(user._id);
    await this.saveRefreshToken(user._id, tokens.refreshToken);

    return {
      ...user.toObject(),
      password: undefined,
      ...tokens,
    };
  }

  async logoutUser(refreshToken) {
    await Token.findOneAndDelete({ refreshToken });
  }

  generateTokens(userId) {
    if (!KEY_ACCESS || !KEY_REFRESH) {
      throw new Error('JWT secret keys are not set in environment variables');
    }
    const accessToken = jwt.sign({ userId }, KEY_ACCESS, {
      expiresIn: '3d',
    });
    const refreshToken = jwt.sign({ userId }, KEY_REFRESH, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(userId, refreshToken) {
    await Token.findOneAndUpdate(
      { user: userId },
      { refreshToken },
      { upsert: true, new: true }
    );
  }
}
