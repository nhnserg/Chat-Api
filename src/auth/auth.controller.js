import { trycatch } from '../helpers/trycatch.js';
import { AuthService } from './auth.service.js';
import { GoogleAuthService } from './auth.google.service.js';
import authVerificationCode from './auth.VerificationCode.js';
import { HttpError } from '../helpers/HttpError.js';
import { User } from '../user/user.model.js';
import { AuthEmailService } from './auth.email.service.js';

export class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.googleAuthService = new GoogleAuthService();
    this.authEmailService = new AuthEmailService();
  }

  register = trycatch(async (req, res) => {
    const user = await this.authService.registerUser(req.body);
    res.status(201).json({
      user,
    });
    res.cookie('accessToken', user.accessToken, {
      httpOnly: true,
      secure: true,
    });
    res.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      secure: true,
    });
  });

  login = trycatch(async (req, res) => {
    const user = await this.authService.loginUser(req.body);
    res.status(200).json({
      user,
    });
    res.cookie('accessToken', user.accessToken, {
      httpOnly: true,
      secure: true,
    });
    res.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      secure: true,
    });
  });

  logout = trycatch(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw HttpError(400, 'Refresh token is required');
    await this.authService.logoutUser(refreshToken);
    res.status(204).json({ message: 'Logout successful' });
  });

  refresh = trycatch(async (req, res) => {
    const { refreshToken } = req.body;
    const user = await this.authService.refresh(refreshToken);
    res.status(200).json({
      user,
    });
    res.cookie('accessToken', user.accessToken, {
      httpOnly: true,
      secure: true,
    });
    res.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      secure: true,
    });
  });

  getProfile = trycatch(async (req, res) => {
    const profile = await this.authService.getUserProfile(req.user);
    res.json({ user: profile });
  });

  googleAuth = (_, res) => {
    const url = this.googleAuthService.getGoogleAuthURL();
    return res.redirect(url);
  };

  googleRedirect = trycatch(async (req, res) => {
    const redirectUrl = await this.googleAuthService.handleGoogleRedirect(req);
    return res.redirect(redirectUrl);
  });

  sendVerificationCode = trycatch(async (req, res) => {
    const { email } = req.body;
    if (!email) throw HttpError(400, 'Email is required');

    const existing = await authVerificationCode.findOne({ email });
    if (existing && existing.expiresAt > new Date(Date.now() + 9 * 60 * 1000)) {
      throw HttpError(429, 'Please wait before requesting a new code');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await authVerificationCode.deleteMany({ email });
    await authVerificationCode.create({ email, code, expiresAt });
    await this.authEmailService.sendVerificationCodeEmail(email, code);

    res.status(201).json({ message: 'Verification code sent' });
  });

  verifyCode = trycatch(async (req, res) => {
    const { email, code } = req.body;
    const record = await authVerificationCode.findOne({ email, code });

    if (!record || record.expiresAt < new Date()) {
      if (record) await authVerificationCode.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    await authVerificationCode.deleteOne({ _id: record._id });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const loginResponse = await this.authService.loginExternalUser(user);

    return res.status(200).json({
      message: 'Verification successful',
      user,
      token: loginResponse.accessToken,
      refreshToken: loginResponse.refreshToken,
    });
  });

  setPassword = trycatch(async (req, res) => {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) throw HttpError(404, 'User not found');

    user.password = password;

    if (!user.providers.includes('local')) {
      user.providers.push('local');
    }

    await user.save();

    res.status(200).json({ message: 'Password set successfully' });
  });
}
