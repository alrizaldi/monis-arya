import { RoomRepository } from './repositories/roomRepository';

const roomRepo = new RoomRepository();

export interface RoomFilters {
  roomNumber?: string;
  roomClass?: string;
  bedNumber?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  filters?: RoomFilters;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class RoomService {
  async getAllRooms() {
    return await roomRepo.findAll();
  }

  async getRoomsWithPagination(options: PaginationOptions): Promise<PaginatedResult<any>> {
    const { page, limit, filters } = options;
    const skip = (page - 1) * limit;

    // Prepare where clause based on filters
    const whereClause: any = {};
    if (filters?.roomNumber) {
      whereClause.roomNumber = {
        contains: filters.roomNumber,
        mode: 'insensitive', // case insensitive search
      };
    }
    if (filters?.roomClass) {
      whereClause.roomClass = {
        contains: filters.roomClass,
        mode: 'insensitive',
      };
    }
    if (filters?.bedNumber !== undefined && filters?.bedNumber !== null) {
      whereClause.bedNumber = filters.bedNumber;
    }

    const [rooms, totalCount] = await Promise.all([
      roomRepo.findWithPagination(skip, limit, whereClause),
      roomRepo.count(whereClause),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: rooms,
      total: totalCount,
      page,
      limit,
      totalPages,
    };
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