import express from 'express';
import { ChatRoom } from './ChatRoom.js';
import { authenticate } from '../middleware/authenticate.js';

const roomRouter = express.Router();

roomRouter.get('/', authenticate, async (req, res) => {
  try {
    const rooms = await ChatRoom.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

roomRouter.post('/', authenticate, async (req, res) => {
  try {
    const room = new ChatRoom({
      name: req.body.name,
      topic: req.body.topic,
    });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

export default roomRouter;
