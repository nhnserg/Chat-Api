import { WebSocketServer } from 'ws';
import { wsAuth } from '../middleware/auth.js';
import { WebSocketService } from '../websocket/webSocket.service.js';

export class WebSocketManager {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.wsService = new WebSocketService();
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', async ws => {
      console.log('New client connected');

      ws.on('message', async data => {
        try {
          const message = JSON.parse(data);
          if (!message.token) {
            ws.send(
              JSON.stringify({ type: 'error', error: 'Token is required' })
            );
            return;
          }

          let user;
          try {
            user = await wsAuth(message.token);
            if (!user) throw new Error('Unauthorized');
          } catch (err) {
            ws.send(
              JSON.stringify({
                type: 'error',
                error: 'Authentication required',
              })
            );
            return;
          }

          switch (message.type) {
            case 'join':
              this.handleJoin(ws, message, user);
              break;
            case 'message':
              if (!message.roomId) {
                ws.send(
                  JSON.stringify({ type: 'error', error: 'roomId is required' })
                );
                return;
              }
              await this.handleMessage(ws, message, user);
              break;
            case 'privateMessage':
              await this.handlePrivateMessage(ws, message, user);
              break;
            case 'typing':
              this.handleTyping(ws, message, user);
              break;
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          if (ws.readyState === ws.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'error',
                error: 'Failed to process message',
              })
            );
          }
        }
      });

      ws.on('close', () => {
        const client = this.wsService.getClientInfo(ws);
        if (!client) return;

        this.broadcast(client.roomId, {
          type: 'userLeft',
          username: client.username,
          timestamp: new Date(),
        });

        this.wsService.removeClient(ws);
      });
    });
  }
}
