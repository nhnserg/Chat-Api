import crypto from 'crypto';
import { trycatch } from '../helpers/trycatch.js';
import { AuthService } from './auth.service.js';
import authVerificationCode from './auth.VerificationCode.js';
import { HttpError } from '../helpers/HttpError.js';
import { AuthEmailService } from './auth.email.service.js';
import { User } from '../user/user.model.js';

export class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.authEmailService = new AuthEmailService();
  }

  sendVerificationCode = trycatch(async (req, res) => {
    const { email } = req.body;
    if (!email) throw HttpError(400, 'Email is required');

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      throw HttpError(409, 'This email is already verified and in use');
    }

    const existing = await authVerificationCode.findOne({ email });
    if (existing && existing.expiresAt > new Date(Date.now() + 9 * 60 * 1000)) {
      throw HttpError(429, 'Please wait before requesting a new code');
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await authVerificationCode.deleteMany({ email });
    await authVerificationCode.create({
      email,
      code,
      expiresAt,
      verified: false,
    });

    await this.authEmailService.sendVerificationCodeEmail(email, code);

    res.status(201).json({ message: 'Verification code sent' });
  });

  verifyCode = trycatch(async (req, res) => {
    const { email, code } = req.body;

    const record = await authVerificationCode.findOne({ email, code });
    if (!record) throw HttpError(404, 'Verification code not found');
    if (record.code !== code) throw HttpError(400, 'Invalid code');
    if (record.expiresAt < new Date()) throw HttpError(400, 'Code expired');

    const user = await User.findOne({ email });

    if (user) {
      user.isVerified = true;
      await user.save();
    } else {
      await authVerificationCode.updateMany({ email }, { verified: true });
    }

    res.status(200).json({ message: 'Email verified successfully' });
  });

  register = trycatch(async (req, res) => {
    const { user, tokens } = await this.authService.registerUser(req.body);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ user, token: tokens.accessToken });
  });

  login = trycatch(async (req, res) => {
    const { user, tokens } = await this.authService.loginUser(req.body);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(200).json({ user, token: tokens.accessToken });
  });

  logout = trycatch(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw HttpError(400, 'Refresh token is required');

    await this.authService.logoutUser(refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.status(204).json({ message: 'Logout successful' });
  });

  refresh = trycatch(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw HttpError(400, 'Refresh token is required');

    const { user, tokens } = await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ user, token: tokens.accessToken });
  });
}
