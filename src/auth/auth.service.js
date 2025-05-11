import { User } from '../user/user.model.js';
import { HttpError } from '../helpers/HttpError.js';
import tokenService from '../token/token.sevice.js';

export class AuthService {
  async registerUser({ name, email, password }) {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw HttpError(409, 'Email is already in use');
    }

    const newUser = await User.create({ name, email, password });

    const tokens = tokenService.generateTokens({ userId: newUser._id });
    await tokenService.saveToken(newUser._id, tokens.refreshToken);

    return {
      ...newUser.toObject(),
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  async loginUser({ email, password }) {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw HttpError(401, 'Email or password invalid');
    }

    const tokens = tokenService.generateTokens({ userId: user._id });
    await tokenService.saveToken(user._id, tokens.refreshToken);

    return {
      ...user.toObject(),
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw HttpError(401, 'Refresh token is missing');
    }

    const tokenData = await tokenService.findToken(refreshToken);
    if (!tokenData) {
      throw HttpError(403, 'Invalid refresh token');
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    if (!userData || !userData.userId) {
      throw HttpError(403, 'Invalid refresh token');
    }

    const user = await User.findById(userData.userId);
    if (!user) {
      throw HttpError(404, 'User not found');
    }

    const tokens = tokenService.generateTokens({ userId: user._id });
    await tokenService.saveToken(user._id, tokens.refreshToken);

    return {
      ...user.toObject(),
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  async logoutUser(refreshToken) {
    await tokenService.removeToken(refreshToken);
  }
}
