import { PrismaClient, type Payer } from '@prisma/client';

const prisma = new PrismaClient();

export class PayerRepository {
  async findAll() {
    return await prisma.payer.findMany();
  }

  async findWithPagination(skip: number, limit: number, whereClause: any = {}) {
    return await prisma.payer.findMany({
      skip,
      take: limit,
      where: whereClause,
      orderBy: {
        createdAt: 'desc', // Sort by creation date descending by default
      },
    });
  }

  async count(whereClause: any = {}) {
    return await prisma.payer.count({
      where: whereClause,
    });
  }

  async findById(id: string) {
    return await prisma.payer.findUnique({
      where: { id }
    });
  }

  async create(data: {
    payerName: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return await prisma.payer.create({
      data: {
        payerName: data.payerName,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date()
      }
    });
  }

  async update(id: string, data: Partial<{
    payerName: string;
    updatedAt: Date;
  }>) {
    return await prisma.payer.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async delete(id: string) {
    return await prisma.payer.delete({
      where: { id }
    });
  }
}