import { ChatRoom } from './ChatRoom.js';

export class RoomService {
  async getAllRooms() {
    return ChatRoom.find();
  }

  async createRoom({ name, topic }) {
    return new ChatRoom({ name, topic }).save();
  }

  async deleteRoom(roomId) {
    return ChatRoom.findByIdAndDelete(roomId);
  }
}
