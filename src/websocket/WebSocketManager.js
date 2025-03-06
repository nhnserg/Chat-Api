import { WebSocketServer } from 'ws'
import { wsAuth } from '../middleware/auth.js'
import { WebSocketService } from '../websocket/webSocket.service.js'

export class WebSocketManager {
	constructor(server) {
		this.wss = new WebSocketServer({ server })
		this.wsService = new WebSocketService()
		this.setupWebSocket()
	}

	setupWebSocket() {
		this.wss.on('connection', async (ws, req) => {
			console.log('New client connected')

			ws.on('message', async data => {
				try {
					const message = JSON.parse(data)
					const user = await wsAuth(message.token)

					if (!user) {
						ws.send(
							JSON.stringify({
								type: 'error',
								error: 'Authentication required',
							})
						)
						return
					}

					switch (message.type) {
						case 'join':
							this.handleJoin(ws, message, user)
							break
						case 'message':
							await this.handleMessage(ws, message, user)
							break
						case 'privateMessage':
							await this.handlePrivateMessage(ws, message, user)
							break
						case 'typing':
							this.handleTyping(ws, message, user)
							break
					}
				} catch (error) {
					console.error('WebSocket message error:', error)
					ws.send(
						JSON.stringify({
							type: 'error',
							error: 'Failed to process message',
						})
					)
				}
			})

			ws.on('close', () => {
				const client = this.wsService.getClientInfo(ws)
				if (client) {
					this.broadcast(client.roomId, {
						type: 'userLeft',
						username: client.username,
						timestamp: new Date(),
					})
					this.wsService.removeClient(ws)
				}
			})
		})
	}

	handleJoin(ws, message, user) {
		this.wsService.addClient(ws, user, message.roomId)

		this.broadcast(
			message.roomId,
			{
				type: 'userJoined',
				username: user.username,
				timestamp: new Date(),
			},
			ws
		)
	}

	async handleMessage(ws, message, user) {
		const newMessage = await this.wsService.handleMessage(user, message)

		this.broadcast(
			message.roomId,
			{
				type: 'message',
				messageId: newMessage._id,
				username: user.username,
				content: message.content,
				timestamp: new Date(),
			},
			ws
		)
	}

	async handlePrivateMessage(ws, message, user) {
		const privateMessage = await this.wsService.handlePrivateMessage(
			user,
			message
		)

		const delivered = this.sendPrivateMessage(message.recipient, {
			type: 'privateMessage',
			messageId: privateMessage._id,
			sender: user.username,
			content: message.content,
			timestamp: new Date(),
		})

		ws.send(
			JSON.stringify({
				type: 'privateMessageStatus',
				messageId: privateMessage._id,
				delivered: delivered,
				timestamp: new Date(),
			})
		)
	}

	handleTyping(ws, message, user) {
		this.broadcast(
			message.roomId,
			{
				type: 'typing',
				username: user.username,
				isTyping: message.isTyping,
			},
			ws
		)
	}

	broadcast(roomId, message, sender) {
		this.wss.clients.forEach(client => {
			const clientInfo = this.wsService.getClientInfo(client)
			if (clientInfo && clientInfo.roomId === roomId && client !== sender) {
				client.send(JSON.stringify(message))
			}
		})
	}

	sendPrivateMessage(username, message) {
		for (const [client, data] of this.wsService.clients) {
			if (data.username === username) {
				client.send(JSON.stringify(message))
				return true
			}
		}
		return false
	}
}
