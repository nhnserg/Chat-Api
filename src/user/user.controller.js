import { trycatch } from '../helpers/trycatch.js';
import { userService } from './user.service.js';

export class UserController {
  constructor() {
    this.userService = new userService();
  }

  getCurrentUser = trycatch(async (req, res) => {
    const { _id, name, email, avatar_url, theme, tokenAccess } = req.user;

    res.json({
      user: { _id, name, email, avatar_url, theme, tokenAccess },
    });
  });

  updateUser = trycatch(async (req, res) => {
    const { _id: userId } = req.user;
    const { body, file } = req;
    const user = await this.userService.updateUser(userId, body, file);

    res.json({ user });
  });

  updateTheme = trycatch(async (req, res) => {
    const { _id: userId } = req.user;
    const { theme } = req.body;
    const user = await this.userService.updateTheme(userId, theme);

    res.json({ user });
  });
}
