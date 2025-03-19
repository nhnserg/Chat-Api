import dotenvConfig from '../dotenvConfig.js';
import { trycatch } from '../helpers/trycatch.js';
import { User } from '../user/user.model.js';
import { AuthService } from './auth.service.js';

const { BASE_URL, FRONTEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } =
  dotenvConfig;

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = trycatch(async (req, res) => {
    const { name, email, password } = req.body;

    const user = await this.authService.registerUser({
      name,
      email,
      password,
    });

    res.status(201).json({ user, token: user.accessToken });
  });

  login = trycatch(async (req, res) => {
    const { email, password } = req.body;

    const user = await this.authService.loginUser({ email, password });

    res.status(200).json({ user });
  });

  logout = trycatch(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw HttpError(400, 'Refresh token is required');
    }

    await this.authService.logoutUser(refreshToken);

    res.status(200).json({ message: 'Logout successful' });
  });

  getProfile = trycatch(async (req, res) => {
    const profile = await this.authService.getUserProfile(req.user);
    res.json({ user: profile });
  });

  refresh = trycatch(async (req, res) => {
    const { refreshToken } = req.body;
    const user = await this.authService.refresh(refreshToken);

    res.status(200).json({ user });
  });
  async googleAuth(_, res) {
    const stringifiedParams = queryString.stringify({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${BASE_URL}/auth/google-redirect`,
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });

    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
    );
  }

  async googleRedirect(req, res) {
    try {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const urlObj = new URL(fullUrl);
      const urlParams = queryString.parse(urlObj.search);
      const code = urlParams.code;

      const tokenData = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: `${BASE_URL}/auth/google-redirect`,
          grant_type: 'authorization_code',
          code,
        }
      );

      const userData = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${tokenData.data.access_token}`,
          },
        }
      );

      let user = await User.findOne({ email: userData.data.email });

      if (!user) {
        user = await User.create({
          name: userData.data.name,
          email: userData.data.email,
          password: 'someRandomPassword',
        });
      }

      const loginResponse = await authService.loginUser({
        email: user.email,
        password: 'someRandomPassword',
      });

      return res.redirect(
        `${FRONTEND_URL}?token=${loginResponse.accessToken}&refreshToken=${loginResponse.refreshToken}`
      );
    } catch (error) {
      console.error('Google auth error:', error);
      throw HttpError(500, 'Google authentication failed');
    }
  }
}
