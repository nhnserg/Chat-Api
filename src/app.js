import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import { swaggerDocument } from './helpers/swaggerSetup.js';
import authRoutes from './auth/auth.routes.js';
import roomRoutes from './room/rooms.routes.js';
import messageRoutes from './messages/messages.routes.js';

export const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/rooms', roomRoutes);
app.use('/messages', messageRoutes);
app.use('/auth', authRoutes);

app.use((_, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, _, res, __) => {
  const { status = 500, message = 'Server error' } = err;
  res.status(status).json({ message });
});
