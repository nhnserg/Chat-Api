import { MessageService } from '../services/messageService.js';

export class MessageController {
  constructor() {
    this.messageService = new MessageService();
  }

  async getRoomMessages(req, res) {
    try {
      const messages = await this.messageService.getRoomMessages(req.params.roomId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPrivateMessages(req, res) {
    try {
      const messages = await this.messageService.getPrivateMessages(req.user.username);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const count = await this.messageService.getUnreadCount(req.user.username);
      res.json({ unreadCount: count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async markAsRead(req, res) {
    try {
      const message = await this.messageService.markMessageAsRead(
        req.params.messageId,
        req.user.username
      );
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}