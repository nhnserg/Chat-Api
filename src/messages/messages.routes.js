import express from 'express';
import { MessageController } from './message.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const messageRouter = express.Router();
const messageController = new MessageController();

messageRouter.get(
  '/room/:roomId',
  authenticate,
  messageController.getRoomMessages
);
messageRouter.get(
  '/private',
  authenticate,
  messageController.getPrivateMessages
);
messageRouter.get('/unread', authenticate, messageController.getUnreadCount);
messageRouter.patch(
  '/:messageId/read',
  authenticate,
  messageController.markAsRead
);

export default messageRouter;
