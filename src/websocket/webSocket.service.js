import { Message } from '../messages/Message.model.js';
import mongoose from 'mongoose';

export class WebSocketService {
  constructor() {
    this.clients = new Map();
  }

  async handleMessage(user, message) {
    try {
      let roomId = message.roomId;
      if (roomId && mongoose.isValidObjectId(roomId) === false) {
        console.warn(
          `⚠ roomId "${roomId}" не является ObjectId, устанавливаем null`
        );
        roomId = null;
      }

      const newMessage = new Message({
        roomId,
        name: user.name,
        sender: user.name,
        content: message.content,
        isPrivate: message.isPrivate || false,
        recipient: message.recipient || null,
      });

      await newMessage.save();
      console.log('✅ Сообщение сохранено:', newMessage);
      return newMessage;
    } catch (error) {
      console.error('❌ Ошибка при сохранении сообщения:', error);
      return null;
    }
  }
  async handlePrivateMessage(ws, message, user) {
    const privateMessage = await this.wsService.handlePrivateMessage(
      user,
      message
    );

    if (!privateMessage) {
      console.error('❌ Ошибка: личное сообщение не отправлено', message);
      return;
    }

    const delivered = this.sendPrivateMessage(message.recipient, {
      type: 'privateMessage',
      messageId: privateMessage._id,
      sender: user.name,
      content: message.content,
      timestamp: new Date(),
    });

    ws.send(
      JSON.stringify({
        type: 'privateMessageStatus',
        messageId: privateMessage._id,
        delivered: delivered,
        timestamp: new Date(),
      })
    );
  }

  addClient(ws, name, roomId) {
    this.clients.set(ws, { name, roomId });
    console.log(`Client added: ${name} to room ${roomId}`);
  }

  removeClient(ws) {
    this.clients.delete(ws);
  }

  getClientInfo(ws) {
    return this.clients.get(ws);
  }
}
