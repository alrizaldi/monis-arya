import { type PendingHistory } from '@prisma/client';
import prisma from '@/lib/prisma';

export class PendingHistoryRepository {
  async findAll() {
    return await prisma.pendingHistory.findMany({
      include: {
        submissionDetail: {
          include: {
            submission: {
              include: {
                patient: true,
                room: true,
                payer: true
              }
            }
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
            submission: {
              include: {
                patient: true,
                room: true,
                payer: true
              }
            }
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
            submission: {
              include: {
                patient: true,
                room: true,
                payer: true
              }
            }
          }
        }
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
        submissionDetailId: data.submissionDetailId,
        pendingType: data.pendingType,
        pendingNote: data.pendingNote
      }
    });
  }

  async update(id: string, data: Partial<{
    pendingType: string;
    pendingNote?: string;
    resolvedAt?: Date;
    isActive: boolean;
  }>) {
    return await prisma.pendingHistory.update({
      where: { id },
      data: {
        ...data
      }
    });
  }

  async resolvePending(id: string) {
    return await prisma.pendingHistory.update({
      where: { id },
      data: {
        resolvedAt: new Date(),
        isActive: false
      }
    });
  }

  async delete(id: string) {
    return await prisma.pendingHistory.delete({
      where: { id }
    });
  }

  async findWithWhereClause(whereClause: any, skip: number, limit: number) {
    return await prisma.pendingHistory.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        submissionDetail: {
          include: {
            submission: {
              include: {
                patient: true,
                room: true,
                payer: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async countWithWhereClause(whereClause: any) {
    return await prisma.pendingHistory.count({
      where: whereClause,
    });
  }
}