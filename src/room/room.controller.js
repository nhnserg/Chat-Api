import { RoomService } from '../services/roomService.js';

export class RoomController {
  constructor() {
    this.roomService = new RoomService();
  }

  async getAllRooms(req, res) {
    try {
      const rooms = await this.roomService.getAllRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createRoom(req, res) {
    try {
      const room = await this.roomService.createRoom(req.body);
      res.status(201).json(room);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}