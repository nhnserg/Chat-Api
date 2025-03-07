import mongoose from 'mongoose';
import config from './dotenvConfig.js';
import { app } from './app.js';
import { createServer } from 'http';
import { WebSocketManager } from './websocket/WebSocketManager.js';

const { MONGO_CONNECT, PORT = 3000 } = config;

mongoose.set('strictQuery', true);

mongoose
  .connect(MONGO_CONNECT)
  .then(() => {
    const server = createServer(app);
    new WebSocketManager(server);

    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });
