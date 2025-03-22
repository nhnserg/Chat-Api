import express from 'express';
import { UserController } from './user.controller.js';
import { validateBody } from '../middleware/validateBody.js';
import { updateThemeSchema, updateUserSchema } from './user.schema.js';
import { authenticate } from '../middleware/authenticate.js';

const userRouter = express.Router();
const userController = new UserController();

userRouter.get('/current', authenticate, userController.getCurrentUser);

userRouter.put(
  '/update',
  authenticate,
  validateBody(updateUserSchema),
  userController.updateUser
);

userRouter.put(
  '/theme',
  authenticate,
  validateBody(updateThemeSchema),
  userController.updateTheme
);

export default userRouter;
