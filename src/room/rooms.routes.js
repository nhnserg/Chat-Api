import express from 'express';
import { RoomController } from './room.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const roomRouter = express.Router();
const roomController = new RoomController();

roomRouter.get('/', authenticate, roomController.getAllRooms);
roomRouter.post('/', authenticate, roomController.createRoom);

export default roomRouter;
