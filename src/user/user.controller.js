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

  changePassword = trycatch(async (req, res) => {
    const { _id: userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    await this.userService.changePassword(userId, currentPassword, newPassword);

    res.status(204).send(); // или { message: 'Password updated successfully' }
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

  deleteUser = trycatch(async (req, res) => {
    const { _id: userId } = req.user;
    const { password } = req.body;

    await this.userService.deleteUser(userId, password);

    res.status(204).send();
  });
}
