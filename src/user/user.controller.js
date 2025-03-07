import { trycatch } from '../helpers/trycatch';
import { userService } from './user.service';

export class UserController {
  constructor() {
    this.userService = new userService();
  }

  getCurrentUser = trycatch(async (req, res) => {
    const { _id, name, email, tokenAccess } = req.user;

    res.json({
      user: { _id, name, email, tokenAccess },
    });
  });

  updateUser = trycatch(async (req, res) => {
    const { _id: userId } = req.user;
    const { body, file } = req;
    const user = await userService.updateUser(userId, body, file);

    res.json({ user });
  });

  updateTheme = trycatch(async (req, res) => {
    const { _id: userId } = req.user;
    const { theme } = req.body;
    const user = await userService.updateTheme(userId, theme);

    res.json({ user });
  });
}
