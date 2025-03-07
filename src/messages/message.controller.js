import { trycatch } from '../helpers/trycatch.js';
import { MessageService } from '../services/messageService.js';

export class MessageController {
  constructor() {
    this.messageService = new MessageService();
  }

  getRoomMessages = trycatch(async (req, res) => {
    const messages = await this.messageService.getRoomMessages(
      req.params.roomId
    );
    res.json(messages);
  });

  getPrivateMessages = trycatch(async (req, res) => {
    const messages = await this.messageService.getPrivateMessages(
      req.user.username
    );

    res.json(messages);
  });

  getUnreadCount = trycatch(async (req, res) => {
    const count = await this.messageService.getUnreadCount(req.user.username);

    res.json({ unreadCount: count });
  });

  markAsRead = trycatch(async (req, res) => {
    const message = await this.messageService.markMessageAsRead(
      req.params.messageId,
      req.user.username
    );

    res.json(message);
  });
}
