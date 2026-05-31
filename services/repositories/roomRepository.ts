import { type Room } from '@prisma/client';
import prisma from '@/lib/prisma';

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
  }) {
    return await prisma.room.create({
      data: {
        roomNumber: data.roomNumber,
        bedNumber: data.bedNumber,
        roomClass: data.roomClass
      }
    });
  }

  async update(id: string, data: {
    roomNumber: string;
    bedNumber?: number;
    roomClass: string;
  }) {
    return await prisma.room.update({
      where: { id },
      data: {
        roomNumber: data.roomNumber,
        bedNumber: data.bedNumber,
        roomClass: data.roomClass
      }
    });
  }

  async delete(id: string) {
    return await prisma.room.delete({
      where: { id }
    });
  }
}