import { Message } from './Message.model.js';

export class MessageService {
  async getRoomMessages(roomId) {
    return Message.find({ roomId }).sort({ timestamp: -1 }).limit(50);
  }

  async getPrivateMessages(name) {
    return Message.find({
      isPrivate: true,
      $or: [{ sender: name }, { recipient: name }],
    }).sort({ timestamp: -1 });
  }

  async getUnreadCount(name) {
    return Message.countDocuments({
      isPrivate: true,
      recipient: name,
      read: false,
    });
  }

  async markMessageAsRead(messageId, name) {
    const message = await Message.findOneAndUpdate(
      { _id: messageId, recipient: name },
      { read: true },
      { new: true }
    );

    if (!message) throw new Error('Message not found');

    return message;
  }
}
