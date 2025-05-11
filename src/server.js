import mongoose from 'mongoose';
import config from './dotenvConfig.js';
import { app } from './app.js';
import { createServer } from 'http';
import { WebSocketManager } from './websocket/WebSocketManager.js';

const { MONGO_CONNECT, PORT = 3005 } = config;

if (!MONGO_CONNECT) {
  console.error('\x1b[31m❌ MONGO_CONNECT is missing in .env\x1b[0m');
  process.exit(1);
}

mongoose.set('strictQuery', true);

mongoose
  .connect(MONGO_CONNECT)
  .then(() => {
    console.log('\x1b[32m✅ Database connection successful\x1b[0m');

    const server = createServer(app);
    new WebSocketManager(server);

    server.listen(PORT, () => {
      console.log(
        `🚀 Server is running on \x1b[34mhttp://localhost:${PORT}\x1b[0m`
      );
    });
  })
  .catch(error => {
    console.error('\x1b[31m❌ Database connection failed:\x1b[0m', error);
    process.exit(1);
  });

const db = mongoose.connection;

const reconnectWithDelay = () => {
  console.warn(
    '\x1b[33m⚠️ Attempting to reconnect to MongoDB in 5 seconds...\x1b[0m'
  );
  setTimeout(() => {
    mongoose
      .connect(MONGO_CONNECT)
      .catch(err =>
        console.error('\x1b[31m❌ Reconnection failed:\x1b[0m', err)
      );
  }, 5000);
};

db.on('error', err => {
  console.error('\x1b[31m⚠️ MongoDB connection error:\x1b[0m', err);
});

db.on('disconnected', () => {
  console.warn(
    '\x1b[33m⚠️ MongoDB disconnected. Trying to reconnect...\x1b[0m'
  );
  reconnectWithDelay();
});
