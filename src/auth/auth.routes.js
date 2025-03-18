import express from 'express';
import { validateBody } from '../middleware/validateBody.js';
import { loginSchema, registerSchema } from '../user/user.schema.js';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const authRouter = express.Router();

const authController = new AuthController();

authRouter.get('/google', authController.googleAuth);

authRouter.get('/google-redirect', authController.googleRedirect);

authRouter.post(
  '/register',
  validateBody(registerSchema),
  authController.register
);

authRouter.post('/login', validateBody(loginSchema), authController.login);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.post('/refresh', authController.refresh);

export default authRouter;
