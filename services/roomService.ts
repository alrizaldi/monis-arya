import { RoomRepository } from './repositories/roomRepository';

const roomRepo = new RoomRepository();

export class RoomService {
  async getAllRooms() {
    return await roomRepo.findAll();
  }

  async getRoomById(id: string) {
    return await roomRepo.findById(id);
  }

  async createRoom(data: {
    roomNumber: string;
    bedNumber: number;
    roomClass: string;
  }) {
    return await roomRepo.create(data);
  }

  async updateRoom(id: string, data: {
    roomNumber: string;
    bedNumber: number;
    roomClass: string;
  }) {
    return await roomRepo.update(id, data);
  }

  async deleteRoom(id: string) {
    return await roomRepo.delete(id);
  }
}