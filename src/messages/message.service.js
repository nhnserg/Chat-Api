import { Message } from '../models/Message.js';

export class MessageService {
  async getRoomMessages(roomId) {
    return await Message.find({ roomId })
      .sort({ timestamp: -1 })
      .limit(50);
  }

  async getPrivateMessages(username) {
    return await Message.find({
      isPrivate: true,
      $or: [
        { sender: username },
        { recipient: username }
      ]
    }).sort({ timestamp: -1 });
  }

  async getUnreadCount(username) {
    return await Message.countDocuments({
      isPrivate: true,
      recipient: username,
      read: false
    });
  }

  async markMessageAsRead(messageId, username) {
    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        recipient: username
      },
      { read: true },
      { new: true }
    );

    if (!message) {
      throw new Error('Message not found');
    }

    return message;
  }
}