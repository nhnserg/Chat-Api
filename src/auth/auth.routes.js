import express from 'express';
import { validateBody } from '../middleware/validateBody.js';
import { loginSchema, registerSchema } from '../user/user.schema.js';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { refreshTokenLimiter } from '../helpers/rateLimite.js';

const authRouter = express.Router();
const controller = new AuthController();

authRouter.post('/verify/send', controller.sendVerificationCode);
authRouter.post('/verify', controller.verifyCode);
authRouter.post('/register', validateBody(registerSchema), controller.register);
authRouter.post('/login', validateBody(loginSchema), controller.login);
authRouter.post('/logout', authenticate, controller.logout);
authRouter.post('/refresh', refreshTokenLimiter, controller.refresh);

export default authRouter;
