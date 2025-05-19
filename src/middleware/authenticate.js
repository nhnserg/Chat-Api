import { HttpError } from '../helpers/HttpError.js';
import { verifyAccessToken } from '../websocket/auth.utils.js';

export const authenticate = async (req, _, next) => {
  let token = null;

  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token && req.headers.authorization) {
    const [bearer, value] = req.headers.authorization.split(' ');
    if (bearer === 'Bearer') {
      token = value;
    }
  }

  if (!token) {
    return next(HttpError(401, 'Access token is missing'));
  }

  const user = await verifyAccessToken(token);
  if (!user) {
    return next(HttpError(401, 'Invalid or expired token'));
  }

  req.user = user;
  next();
};
