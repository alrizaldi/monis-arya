import { PrismaClient, type PendingHistory } from '@prisma/client';

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
      include: {
        submissionDetail: {
          include: {
            submission: true
          }
        }
      }
    });
  }

  async create(data: {
    submissionDetailId: string;
    pendingType: string; // Accepting string directly since there's no enum
    pendingNote?: string;
  }) {
    return await prisma.pendingHistory.create({
      data: {
        submissionDetailId: data.submissionDetailId,
        pendingType: data.pendingType, // Just use the string directly
        pendingNote: data.pendingNote
      },
      include: {
        submissionDetail: {
          include: {
            submission: true
          }
        }
      }
    });
  }

  async update(id: string, data: Partial<{
    pendingType: string; // Accepting string directly since there's no enum
    pendingNote?: string;
    resolvedAt?: Date;
    isActive?: boolean;
  }>) {
    return await prisma.pendingHistory.update({
      where: { id },
      data: {
        ...data,
        pendingType: data.pendingType, // Just use the string directly
      },
      include: {
        submissionDetail: {
          include: {
            submission: true
          }
        }
      }
    });
  }

  async resolvePending(id: string) {
    return await prisma.pendingHistory.update({
      where: { id },
      data: {
        resolvedAt: new Date(),
        isActive: false
      },
      include: {
        submissionDetail: {
          include: {
            submission: true
          }
        }
      }
    });
  }

  async delete(id: string) {
    return await prisma.pendingHistory.delete({
      where: { id }
    });
  }
}