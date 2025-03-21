import { User } from '../user/user.model.js';
import tokenService from '../token/token.sevice.js';
import { HttpError } from '../helpers/index.js';

export const authenticate = async token => {
  if (!token) {
    throw HttpError(401, 'Token is required');
  }

  try {
    const accessUser = tokenService.validateAccessToken(token);
    if (!accessUser || Date.now() > accessUser.exp * 1000) {
      throw HttpError(401, 'Token expired or invalid');
    }

    const user = await User.findById(accessUser.userId);
    if (!user) {
      throw HttpError(401, 'User not found');
    }

    user.tokenAccess = token;
    return user;
  } catch (error) {
    console.log(error);
    throw HttpError(401, 'Not authorized');
  }
};
