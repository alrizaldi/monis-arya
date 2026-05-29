import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditLogRepository {
  async findAll() {
    return await prisma.auditLog.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findById(id: string) {
    return await prisma.auditLog.findUnique({
      where: { id }
    });
  }

  async findByModule(moduleName: string) {
    return await prisma.auditLog.findMany({
      where: { moduleName },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findByAction(actionType: string) {
    return await prisma.auditLog.findMany({
      where: { actionType },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async create(data: {
    moduleName: string;
    actionType: string;
    referenceId?: string;
    description: string;
    createdBy?: string;
  }) {
    return await prisma.auditLog.create({
      data
    });
  }

  async delete(id: string) {
    return await prisma.auditLog.delete({
      where: { id }
    });
  }
}