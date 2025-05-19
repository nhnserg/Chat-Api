import bcrypt from 'bcryptjs';
import { User } from './user.model.js';
import { HttpError } from '../helpers/HttpError.js';

export class userService {
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) throw HttpError(404, 'User not found');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw HttpError(400, 'Current password is incorrect');

    user.password = newPassword;
    await user.save();
  }
  async updateUser(userId, formData, FormFile) {
    if (formData.password) {
      formData.password = await bcrypt.hash(formData.password, 10);
    }

    if (!FormFile) {
      return User.findByIdAndUpdate({ _id: userId }, formData, {
        new: true,
      }).select({
        name: 1,
        email: 1,
        avatar_url: 1,
        theme: 1,
      });
    }
    await imageAvatarService.processAvatarImage({ width: 68, height: 68 });
    const avatarURL = await imageAvatarService.saveImageToCloud(
      CLOUDINARY_FOLDER.AVATARS
    );

    return User.findByIdAndUpdate(
      userId,
      { ...formData, avatar_url: avatarURL },
      { new: true }
    ).select({
      name: 1,
      email: 1,
      avatar_url: 1,
      theme: 1,
    });
  }

  async updateTheme(userId, theme) {
    return User.findByIdAndUpdate({ _id: userId }, { theme }, { new: true });
  }
  async deleteUser(userId, password) {
    const user = await User.findById(userId);
    if (!user) throw HttpError(404, 'User not found');

    if (user.providers.includes('local')) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) throw HttpError(400, 'Incorrect password');
    }

    await User.findByIdAndDelete(userId);
  }
}
