import { PrismaClient, type AuditLog } from '@prisma/client';

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

  async create(data: {
    moduleName: string;
    actionType: string;
    referenceId?: string;
    description: string;
    createdBy: string;
    createdAt?: Date;
  }) {
    return await prisma.auditLog.create({
      data: {
        moduleName: data.moduleName,
        actionType: data.actionType,
        referenceId: data.referenceId,
        description: data.description,
        createdBy: data.createdBy,
        createdAt: data.createdAt || new Date()
      }
    });
  }

  async delete(id: string) {
    return await prisma.auditLog.delete({
      where: { id }
    });
  }
}