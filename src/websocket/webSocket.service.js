import { Message } from '../messages/Message.model.js';
import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';

export class WebSocketService {
  constructor() {
    this.clients = new Map();
  }

  addClient(ws, name) {
    this.clients.set(ws, {
      name,
      rooms: new Set(),
      roles: new Map(),
    });
  }

  removeClient(ws) {
    this.clients.delete(ws);
  }

  getClientInfo(ws) {
    return this.clients.get(ws);
  }

  joinRoom(ws, roomId) {
    const client = this.clients.get(ws);
    if (client) {
      client.rooms.add(roomId);
    }
  }

  leaveRoom(ws, roomId) {
    const client = this.clients.get(ws);
    if (client) {
      client.rooms.delete(roomId);
    }
  }

  setRole(ws, roomId, role) {
    const client = this.clients.get(ws);
    if (client) {
      client.roles.set(roomId, role);
    }
  }

  getRole(ws, roomId) {
    const client = this.clients.get(ws);
    return client ? client.roles.get(roomId) : null;
  }

  async handleMessage(user, message) {
    try {
      if (!user || !user.name) {
        console.warn('⛔ Сообщение от неавторизованного пользователя');
        return null;
      }

      let roomId = message.roomId;
      if (roomId && !mongoose.isValidObjectId(roomId)) {
        console.warn(
          `⚠ roomId "${roomId}" не является ObjectId, устанавливаем null`
        );
        roomId = null;
      }

      const content = sanitizeHtml(message.content, {
        allowedTags: [],
        allowedAttributes: {},
      });

      const newMessage = new Message({
        roomId,
        name: user.name,
        sender: user.name,
        content,
        isPrivate: message.isPrivate || false,
        recipient: message.recipient || null,
      });

      await newMessage.save();
      return newMessage;
    } catch (error) {
      console.error('❌ Ошибка при сохранении сообщения:', error);
      return null;
    }
  }

  async handlePrivateMessage(user, message) {
    const newMessage = await this.handleMessage(user, {
      ...message,
      isPrivate: true,
    });

    if (!newMessage) return null;

    const delivered = this.sendPrivateMessage(message.recipient, {
      type: 'privateMessage',
      messageId: newMessage._id,
      sender: user.name,
      content: newMessage.content,
      timestamp: newMessage.timestamp,
    });

    return { newMessage, delivered };
  }

  sendPrivateMessage(recipientName, message) {
    for (const [client, data] of this.clients.entries()) {
      if (data.name === recipientName) {
        client.send(JSON.stringify(message));
        return true;
      }
    }
    return false;
  }

  broadcast(roomId, message, sender) {
    for (const [client, data] of this.clients.entries()) {
      if (data.rooms.has(roomId) && client !== sender) {
        client.send(JSON.stringify(message));
      }
    }
  }

  async sendUnreadMessages(ws, userName) {
    const messages = await Message.find({
      isPrivate: true,
      recipient: userName,
      read: false,
    });

    messages.forEach(msg => {
      ws.send(
        JSON.stringify({
          type: 'privateMessage',
          messageId: msg._id,
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp,
        })
      );
    });
  }
}
