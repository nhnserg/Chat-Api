import { trycatch } from '../helpers/trycatch.js';
import { RoomService } from '../services/roomService.js';

export class RoomController {
  constructor() {
    this.roomService = new RoomService();
  }

  getAllRooms = trycatch(async (_, res) => {
    const rooms = await this.roomService.getAllRooms();

    res.json(rooms);
  });

  createRoom = trycatch(async (req, res) => {
    const room = await this.roomService.createRoom(req.body);

    res.status(201).json(room);
  });
}
