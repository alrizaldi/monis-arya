import { PrismaClient, type Room } from '@prisma/client';

const prisma = new PrismaClient();

export class RoomRepository {
  async findAll() {
    return await prisma.room.findMany();
  }

  async findWithPagination(skip: number, limit: number, whereClause: any = {}) {
    return await prisma.room.findMany({
      skip,
      take: limit,
      where: whereClause,
      orderBy: {
        createdAt: 'desc', // Sort by creation date descending by default
      },
    });
  }

  async count(whereClause: any = {}) {
    return await prisma.room.count({
      where: whereClause,
    });
  }

  async findById(id: string) {
    return await prisma.room.findUnique({
      where: { id }
    });
  }

  async create(data: {
    roomNumber: string;
    bedNumber?: number;
    roomClass: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return await prisma.room.create({
      data: {
        roomNumber: data.roomNumber,
        bedNumber: data.bedNumber,
        roomClass: data.roomClass,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date()
      }
    });
  }

  async update(id: string, data: Partial<{
    roomNumber: string;
    bedNumber?: number;
    roomClass: string;
    updatedAt: Date;
  }>) {
    return await prisma.room.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async delete(id: string) {
    return await prisma.room.delete({
      where: { id }
    });
  }
}