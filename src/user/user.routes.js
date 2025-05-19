import express from 'express';
import { UserController } from './user.controller.js';
import { validateBody } from '../middleware/validateBody.js';
import {
  changePasswordSchema,
  deleteUserSchema,
  updateThemeSchema,
  updateUserSchema,
} from './user.schema.js';
import { authenticate } from '../middleware/authenticate.js';

const userRouter = express.Router();
const сontroller = new UserController();

userRouter.get('/current', authenticate, сontroller.getCurrentUser);

userRouter.put(
  '/update',
  authenticate,
  validateBody(updateUserSchema),
  сontroller.updateUser
);

userRouter.put(
  '/theme',
  authenticate,
  validateBody(updateThemeSchema),
  сontroller.updateTheme
);

userRouter.put(
  '/password',
  authenticate,
  validateBody(changePasswordSchema),
  сontroller.changePassword
);
userRouter.delete(
  '/delete',
  authenticate,
  validateBody(deleteUserSchema),
  сontroller.deleteUser
);

export default userRouter;
