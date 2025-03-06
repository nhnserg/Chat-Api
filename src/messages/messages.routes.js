import express from 'express'
import { auth } from '../middleware/auth.js'
import { Message } from './Message.model.js'

const router = express.Router()

/**
 * @swagger
 * /api/messages/room/{roomId}:
 *   get:
 *     summary: Get messages for a specific room
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Not authenticated
 */
router.get('/room/:roomId', auth, async (req, res) => {
	try {
		const messages = await Message.find({ roomId: req.params.roomId })
			.sort({ timestamp: -1 })
			.limit(50)
		res.json(messages)
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch messages' })
	}
})

/**
 * @swagger
 * /api/messages/private:
 *   get:
 *     summary: Get private messages for current user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of private messages
 *       401:
 *         description: Not authenticated
 */
router.get('/private', auth, async (req, res) => {
	try {
		const messages = await Message.find({
			isPrivate: true,
			$or: [{ sender: req.user.username }, { recipient: req.user.username }],
		}).sort({ timestamp: -1 })

		res.json(messages)
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch private messages' })
	}
})

/**
 * @swagger
 * /api/messages/unread:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Number of unread messages
 *       401:
 *         description: Not authenticated
 */
router.get('/unread', auth, async (req, res) => {
	try {
		const unreadCount = await Message.countDocuments({
			isPrivate: true,
			recipient: req.user.username,
			read: false,
		})

		res.json({ unreadCount })
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch unread count' })
	}
})

/**
 * @swagger
 * /api/messages/{messageId}/read:
 *   patch:
 *     summary: Mark a message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message marked as read
 *       401:
 *         description: Not authenticated
 */
router.patch('/:messageId/read', auth, async (req, res) => {
	try {
		const message = await Message.findOneAndUpdate(
			{
				_id: req.params.messageId,
				recipient: req.user.username,
			},
			{ read: true },
			{ new: true }
		)

		if (!message) {
			return res.status(404).json({ error: 'Message not found' })
		}

		res.json(message)
	} catch (error) {
		res.status(500).json({ error: 'Failed to mark message as read' })
	}
})

export default router
