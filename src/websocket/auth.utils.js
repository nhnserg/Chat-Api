import { User } from '../user/user.model.js';
import tokenService from '../token/token.sevice.js';

export async function verifyAccessToken(token) {
  try {
    const payload = tokenService.validateAccessToken(token); // → { userId }
    const user = await User.findById(payload.userId);
    if (!user || !user.isVerified) return null;
    return user;
  } catch (err) {
    console.log('❌ Token verification error:', err);
    return null;
  }
}
