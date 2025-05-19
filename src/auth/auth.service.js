import { User } from '../user/user.model.js';
import { HttpError } from '../helpers/HttpError.js';
import tokenService from '../token/token.sevice.js';

export class AuthService {
  async registerUser({ email, password }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw HttpError(409, 'Email is already in use');

    const name = `user${Math.floor(Math.random() * 1e9)}`;
    const newUser = await User.create({
      name,
      email,
      password,
      isVerified: false,
    });

    const tokens = tokenService.generateTokens({ userId: newUser._id });
    await tokenService.saveToken(newUser._id, tokens.refreshToken);

    return { user: newUser.toJSON(), tokens };
  }

  async loginUser({ email, password }) {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw HttpError(401, 'Email or password invalid');
    }

    if (!user.isVerified) {
      throw HttpError(403, 'Please verify your email before logging in');
    }

    const tokens = tokenService.generateTokens({ userId: user._id });
    await tokenService.saveToken(user._id, tokens.refreshToken);

    return { user: user.toJSON(), tokens };
  }

  async refresh(refreshToken) {
    const tokenData = await tokenService.findToken(refreshToken);
    if (!tokenData) throw HttpError(403, 'Invalid refresh token');

    const userData = tokenService.validateRefreshToken(refreshToken);
    if (!userData?.userId) throw HttpError(403, 'Invalid refresh token');

    const user = await User.findById(userData.userId);
    if (!user) throw HttpError(404, 'User not found');

    const tokens = tokenService.generateTokens({ userId: user._id });
    await tokenService.saveToken(user._id, tokens.refreshToken);

    return { user: user.toJSON(), tokens };
  }

  async logoutUser(refreshToken) {
    await tokenService.removeToken(refreshToken);
  }
}
