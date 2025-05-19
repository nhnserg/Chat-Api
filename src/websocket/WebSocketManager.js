import { WebSocketServer } from 'ws';
import { WebSocketService } from './webSocket.service.js';
import { verifyAccessToken } from './auth.utils.js';

export class WebSocketManager {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.wsService = new WebSocketService();
    this.setupWebSocket();
    this.startHeartbeat();
  }

  setupWebSocket() {
    this.wss.on('connection', ws => {
      let user = null;

      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', async data => {
        try {
          const message = JSON.parse(data);

          if (message.type === 'auth') {
            user = await verifyAccessToken(message.token);
            if (!user) {
              ws.send(JSON.stringify({ type: 'error', error: 'Unauthorized' }));
              ws.close();
              return;
            }

            this.wsService.addClient(ws, user.name);
            ws.send(JSON.stringify({ type: 'authSuccess', name: user.name }));
            return;
          }

          if (!user) {
            ws.send(
              JSON.stringify({ type: 'error', error: 'Not authenticated' })
            );
            return;
          }

          switch (message.type) {
            case 'join':
              this.handleJoin(ws, user, message);
              break;
            case 'message':
              await this.handleMessage(ws, user, message);
              break;
            case 'privateMessage':
              await this.handlePrivateMessage(ws, user, message);
              break;
            case 'typing':
              this.handleTyping(ws, user, message);
              break;
            default:
              ws.send(JSON.stringify({ type: 'error', error: 'Unknown type' }));
          }
        } catch (err) {
          console.error('❌ Ошибка разбора сообщения:', err);
          ws.send(
            JSON.stringify({ type: 'error', error: 'Invalid message format' })
          );
        }
      });

      ws.on('close', () => {
        this.wsService.removeClient(ws);
      });
    });
  }
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
          console.log('❌ Клиент не отвечает. Закрываю соединение');
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  handleJoin(ws, user, message) {
    const { roomId } = message;
    this.wsService.joinRoom(ws, roomId);
    this.wsService.broadcast(
      roomId,
      {
        type: 'userJoined',
        username: user.name,
        timestamp: new Date(),
      },
      ws
    );
    this.wsService.sendUnreadMessages(ws, user._id);
  }

  async handleMessage(ws, user, message) {
    const newMessage = await this.wsService.handleMessage(user, message);
    if (!newMessage) {
      ws.send(
        JSON.stringify({ type: 'error', error: 'Failed to save message' })
      );
      return;
    }

    this.wsService.broadcast(
      message.roomId,
      {
        type: 'message',
        messageId: newMessage._id,
        username: user.name,
        content: newMessage.content,
        timestamp: newMessage.timestamp,
      },
      ws
    );
  }

  async handlePrivateMessage(ws, user, message) {
    const result = await this.wsService.handlePrivateMessage(user, message);
    if (!result) {
      ws.send(
        JSON.stringify({
          type: 'error',
          error: 'Failed to send private message',
        })
      );
      return;
    }

    ws.send({
      type: 'privateMessageStatus',
      messageId: result.newMessage._id,
      delivered: result.delivered,
      timestamp: new Date(),
    });
  }

  handleTyping(ws, user, message) {
    this.wsService.broadcast(
      message.roomId,
      {
        type: 'typing',
        username: user.name,
        isTyping: message.isTyping,
      },
      ws
    );
  }
  stopHeartbeat() {
    clearInterval(this.heartbeatInterval);
  }
}
