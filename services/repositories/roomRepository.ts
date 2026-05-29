import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RoomRepository {
  async findAll() {
    return await prisma.room.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findById(id: string) {
    return await prisma.room.findUnique({
      where: { id }
    });
  }

  async create(data: {
    roomNumber: string;
    bedNumber: number;
    roomClass: string;
  }) {
    return await prisma.room.create({
      data
    });
  }

  async update(id: string, data: {
    roomNumber: string;
    bedNumber: number;
    roomClass: string;
  }) {
    return await prisma.room.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return await prisma.room.delete({
      where: { id }
    });
  }
}