import { User } from '../user/user.model.js';
import { AuthService } from './auth.service.js';
import dotenvConfig from '../dotenvConfig.js';

const { BASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL } =
  dotenvConfig;

export class GoogleAuthService {
  constructor() {
    this.authService = new AuthService();
  }

  getGoogleAuthURL() {
    const params = new URLSearchParams({
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

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleGoogleRedirect(req) {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const urlObj = new URL(fullUrl);
    const code = urlObj.searchParams.get('code');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${BASE_URL}/auth/google-redirect`,
        grant_type: 'authorization_code',
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const userData = await userInfoResponse.json();

    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create({
        name: userData.name,
        email: userData.email,
        providers: ['google'],
        avatar_url: userData.picture,
      });
    } else if (!user.providers.includes('google')) {
      user.providers.push('google');
      await user.save();
    }

    const loginResponse = await this.authService.loginExternalUser(user);
    return `${FRONTEND_URL}?token=${loginResponse.accessToken}&refreshToken=${loginResponse.refreshToken}`;
  }
}
