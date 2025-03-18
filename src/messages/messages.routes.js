import express from 'express';
import { Message } from './Message.model.js';
import { authenticate } from '../middleware/authenticate.js';

const messageRouter = express.Router();

messageRouter.get('/room/:roomId', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

messageRouter.get('/private', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({
      isPrivate: true,
      $or: [{ sender: req.user.name }, { recipient: req.user.name }],
    }).sort({ timestamp: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch private messages' });
  }
});

messageRouter.get('/unread', authenticate, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      isPrivate: true,
      recipient: req.user.name,
      read: false,
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

messageRouter.patch('/:messageId/read', authenticate, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      {
        _id: req.params.messageId,
        recipient: req.user.name,
      },
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

export default messageRouter;
