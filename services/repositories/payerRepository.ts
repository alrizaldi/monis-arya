import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PayerRepository {
  async findAll() {
    return await prisma.payer.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findById(id: string) {
    return await prisma.payer.findUnique({
      where: { id }
    });
  }

  async create(data: {
    payerName: string;
  }) {
    return await prisma.payer.create({
      data
    });
  }

  async update(id: string, data: {
    payerName: string;
  }) {
    return await prisma.payer.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return await prisma.payer.delete({
      where: { id }
    });
  }
}