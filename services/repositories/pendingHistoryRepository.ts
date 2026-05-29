import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PendingHistoryRepository {
  async findAll() {
    return await prisma.pendingHistory.findMany({
      include: {
        submissionDetail: {
          include: {
            submission: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findById(id: string) {
    return await prisma.pendingHistory.findUnique({
      where: { id },
      include: {
        submissionDetail: {
          include: {
            submission: true
          }
        }
      }
    });
  }

  async findBySubmissionDetailId(submissionDetailId: string) {
    return await prisma.pendingHistory.findMany({
      where: { submissionDetailId },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findByIsActive(isActive: boolean) {
    return await prisma.pendingHistory.findMany({
      where: { isActive },
      include: {
        submissionDetail: {
          include: {
            submission: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async create(data: {
    submissionDetailId: string;
    pendingType: string;
    pendingNote?: string;
  }) {
    return await prisma.pendingHistory.create({
      data: {
        ...data,
        isActive: true
      }
    });
  }

  async update(id: string, data: Partial<{
    pendingType: string;
    pendingNote: string;
    resolvedAt: Date;
    isActive: boolean;
  }>) {
    return await prisma.pendingHistory.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return await prisma.pendingHistory.delete({
      where: { id }
    });
  }

  async resolvePending(id: string) {
    return await prisma.pendingHistory.update({
      where: { id },
      data: {
        isActive: false,
        resolvedAt: new Date()
      }
    });
  }
}