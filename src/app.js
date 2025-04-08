import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import { swaggerDocument } from './helpers/swaggerSetup.js';
import authRoutes from './auth/auth.routes.js';
import roomRoutes from './room/rooms.routes.js';
import messageRoutes from './messages/messages.routes.js';
import userRouter from './user/user.routes.js';
import { errorHandler, notFoundHandler } from './helpers/errorHandlers.js';

export const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/room', roomRoutes);
app.use('/messages', messageRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRouter);

app.use(notFoundHandler);
app.use(errorHandler);
