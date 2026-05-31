import { PrismaClient, type PendingHistory } from '@prisma/client';

const prisma = new PrismaClient();

export class PendingHistoryRepository {
  async findAll() {
    return await prisma.pendingHistory.findMany({
      include: {
        submissionDetail: {
          include: {
            submission: {
              include: {
                patient: true,
                payer: true
              }
            }
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
            submission: {
              include: {
                patient: true,
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
                payer: true
              }
            }
          }
        }
      }
    });
  }

  async findByIsActive(isActive: boolean) {
    return await prisma.pendingHistory.findMany({
      where: { isActive },
      include: {
        submissionDetail: {
          include: {
            submission: {
              include: {
                patient: true,
                payer: true
              }
            }
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
    pendingType: string; // Accepting string directly since there's no enum
    pendingNote?: string;
  }) {
    return await prisma.pendingHistory.create({
      data: {
        submissionDetailId: data.submissionDetailId,
        pendingType: data.pendingType, // Just use the string directly
        pendingNote: data.pendingNote,
        isActive: true // New pending records are active by default
      },
      include: {
        submissionDetail: {
          include: {
            submission: {
              include: {
                patient: true,
                payer: true
              }
            }
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
            submission: {
              include: {
                patient: true,
                payer: true
              }
            }
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
            submission: {
              include: {
                patient: true,
                payer: true
              }
            }
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
  
  async findWithWhereClause(whereClause: any, skip: number, limit: number) {
    return await prisma.pendingHistory.findMany({
      where: whereClause,
      include: {
        submissionDetail: {
          include: {
            submission: {
              include: {
                patient: true,
                payer: true
              }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
  
  async countWithWhereClause(whereClause: any) {
    return await prisma.pendingHistory.count({
      where: whereClause
    });
  }
}