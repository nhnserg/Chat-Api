import { User } from '../user/user.model.js';
import tokenService from '../token/token.sevice.js';
import { HttpError } from '../helpers/index.js';

export const authenticate = async (req, _, next) => {
  const [bearer, accessToken] = req.headers.authorization?.split(' ') || [];

  if (bearer !== 'Bearer') {
    next(HttpError(401, 'No Bearer token provided'));
    return;
  }

  try {
    const accessUser = tokenService.validateAccessToken(accessToken);

    if (!accessUser) {
      next(HttpError(401, 'Invalid or expired token'));
      return;
    }

    const user = await User.findById(accessUser.userId);

    if (!user) {
      return next(HttpError(401, 'User not found in DB.'));
    }

    user.tokenAccess = accessToken;
    req.user = user;
  } catch (error) {
    console.log(error);
    next(HttpError(401, 'Not authorized'));
  }

  return next();
};

// export const authenticate = async token => {
//   if (!token) {
//     throw HttpError(401, 'Token is required');
//   }

//   try {
//     const accessUser = tokenService.validateAccessToken(token);
//     if (!accessUser || Date.now() > accessUser.exp * 1000) {
//       throw HttpError(401, 'Token expired or invalid');
//     }

//     const user = await User.findById(accessUser.userId);
//     if (!user) {
//       throw HttpError(401, 'User not found');
//     }

//     user.tokenAccess = token;
//     return user;
//   } catch (error) {
//     console.log(error);
//     throw HttpError(401, 'Not authorized');
//   }
// };
