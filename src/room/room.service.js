import { ChatRoom } from '../models/ChatRoom.js';

export class RoomService {
  async getAllRooms() {
    return await ChatRoom.find();
  }

  async createRoom({ name, topic }) {
    const room = new ChatRoom({ name, topic });
    return await room.save();
  }
}