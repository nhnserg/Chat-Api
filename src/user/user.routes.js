import express from 'express';
import { UserController } from './user.controller';
import { validateBody } from '../middleware/validateBody.js';
import { updateThemeSchema } from './user.schema.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();
const userController = new UserController();

router.get('/current', authenticate, userController.getCurrentUser);

router.put(
  '/update',
  authenticate,
  validateBody(updateUserSchema),
  userController.updateUser
);

router.put(
  '/theme',
  authenticate,
  validateBody(updateThemeSchema),
  userController.updateTheme
);

export default router;
