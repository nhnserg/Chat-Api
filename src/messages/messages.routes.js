import express from 'express';
import { auth } from '../middleware/auth.js';
import { Message } from './Message.model.js';

const messageRouter = express.Router();

messageRouter.get('/room/:roomId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

messageRouter.get('/private', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      isPrivate: true,
      $or: [{ sender: req.user.username }, { recipient: req.user.username }],
    }).sort({ timestamp: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch private messages' });
  }
});

messageRouter.get('/unread', auth, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      isPrivate: true,
      recipient: req.user.username,
      read: false,
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

messageRouter.patch('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      {
        _id: req.params.messageId,
        recipient: req.user.username,
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
