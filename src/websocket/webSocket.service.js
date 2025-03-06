import { Message } from '../messages/Message.model.js'

export class WebSocketService {
	constructor() {
		this.clients = new Map()
	}

	async handleMessage(user, message) {
		const newMessage = new Message({
			roomId: message.roomId,
			username: user.username,
			content: message.content,
			sender: user.username,
			timestamp: new Date(),
		})
		return await newMessage.save()
	}

	async handlePrivateMessage(user, message) {
		const privateMessage = new Message({
			isPrivate: true,
			content: message.content,
			sender: user.username,
			recipient: message.recipient,
			username: user.username,
			timestamp: new Date(),
		})
		return await privateMessage.save()
	}

	addClient(ws, user, roomId) {
		this.clients.set(ws, {
			username: user.username,
			roomId,
		})
	}

	removeClient(ws) {
		this.clients.delete(ws)
	}

	getClientInfo(ws) {
		return this.clients.get(ws)
	}
}
