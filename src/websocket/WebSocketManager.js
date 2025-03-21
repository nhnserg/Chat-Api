import { WebSocketServer } from 'ws';
import { WebSocketService } from '../websocket/webSocket.service.js';
import { authenticate } from '../middleware/authenticate.js';

export class WebSocketManager {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.wsService = new WebSocketService();
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', async (ws, req) => {
      const token = new URL(
        req.url,
        `http://${req.headers.host}`
      ).searchParams.get('token');
      if (!token) {
        ws.send(
          JSON.stringify({ type: 'error', error: 'Authentication required' })
        );
        ws.close();
        return;
      }

      // Authenticate the user using the token
      const user = await authenticate(token);
      if (!user) {
        ws.send(JSON.stringify({ type: 'error', error: 'Invalid token' }));
        ws.close();
        return;
      }

      console.log(`✅ User ${user.username} connected`);

      ws.on('message', async data => {
        try {
          const message = JSON.parse(data);

          switch (message.type) {
            case 'join':
              this.handleJoin(ws, message, user);
              break;
            case 'message':
              await this.handleMessage(ws, message, user);
              break;
            case 'privateMessage':
              await this.handlePrivateMessage(ws, message, user);
              break;
            case 'typing':
              this.handleTyping(ws, message, user);
              break;
            default:
              console.warn('⚠ Неизвестный тип сообщения:', message.type);
          }
        } catch (error) {
          console.error('❌ Ошибка обработки сообщения:', error);
          ws.send(
            JSON.stringify({ type: 'error', error: 'Invalid message format' })
          );
        }
      });

      ws.on('close', () => {
        const client = this.wsService.getClientInfo(ws);
        if (!client) return;

        console.log(
          `❌ Клиент ${client.username} покинул чат ${client.roomId}`
        );
        this.broadcast(client.roomId, {
          type: 'userLeft',
          username: client.username,
          timestamp: new Date(),
        });
        this.wsService.removeClient(ws);
      });
    });
  }

  handleJoin(ws, message) {
    const roomId = message.roomId || message.room;
    if (!roomId) {
      console.error('⛔ Ошибка: комната не указана при входе:', message);
      return;
    }

    this.wsService.addClient(ws, message.username, roomId);
    console.log(`👤 ${message.username} присоединился к ${roomId}`);

    this.broadcast(
      message.roomId,
      {
        type: 'userJoined',
        username: message.username,
        timestamp: new Date(),
      },
      ws
    );
  }

  async handleMessage(ws, message, user) {
    const newMessage = await this.wsService.handleMessage(user, message);

    if (!newMessage) {
      console.error('❌ Ошибка: сообщение не сохранено', message);
      return;
    }

    this.broadcast(
      message.roomId,
      {
        type: 'message',
        messageId: newMessage._id,
        username: user.name,
        content: message.content,
        timestamp: new Date(),
      },
      ws
    );
  }

  async handlePrivateMessage(ws, message) {
    const privateMessage = await this.wsService.handlePrivateMessage(message);

    if (!privateMessage) {
      console.error('❌ Ошибка: личное сообщение не отправлено', message);
      return;
    }

    const delivered = this.sendPrivateMessage(message.recipient, {
      type: 'privateMessage',
      messageId: privateMessage._id,
      sender: message.username,
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

  handleTyping(ws, message) {
    this.broadcast(
      message.roomId,
      {
        type: 'typing',
        username: message.username,
        isTyping: message.isTyping,
      },
      ws
    );
  }

  broadcast(roomId, message, sender) {
    this.wss.clients.forEach(client => {
      const clientInfo = this.wsService.getClientInfo(client);
      if (clientInfo && clientInfo.roomId === roomId && client !== sender) {
        client.send(JSON.stringify(message));
      }
    });
  }

  sendPrivateMessage(username, message) {
    for (const [client, data] of this.wsService.clients) {
      if (data.username === username) {
        client.send(JSON.stringify(message));
        return true;
      }
    }
    return false;
  }
}
