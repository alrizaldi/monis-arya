import { PrismaClient, type SubmissionDetail, SubmissionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export class SubmissionDetailRepository {
  async findAll() {
    return await prisma.submissionDetail.findMany({
      include: {
        submission: true,
        pendingHistories: true
      }
    });
  }

  async findById(id: string) {
    return await prisma.submissionDetail.findUnique({
      where: { id },
      include: {
        submission: true,
        pendingHistories: {
          include: {
            submissionDetail: {
              include: {
                submission: true
              }
            }
          }
        }
      }
    });
  }

  async findBySubmissionId(submissionId: string) {
    return await prisma.submissionDetail.findMany({
      where: { submissionId },
      include: {
        submission: true,
        pendingHistories: {
          where: {
            isActive: true
          }
        }
      }
    });
  }

  async create(data: {
    submissionId: string;
    submissionType: string; // Accepting string and converting to enum
    submissionValue: Decimal;
    note?: string;
  }) {
    return await prisma.submissionDetail.create({
      data: {
        submissionId: data.submissionId,
        submissionType: data.submissionType as SubmissionType, // Convert string to enum
        submissionValue: data.submissionValue,
        note: data.note
      },
      include: {
        submission: true,
        pendingHistories: {
          where: {
            isActive: true
          }
        }
      }
    });
  }

  async update(id: string, data: Partial<{
    submissionType: string; // Accepting string and converting to enum
    submissionValue?: Decimal;
    note?: string;
  }>) {
    return await prisma.submissionDetail.update({
      where: { id },
      data: {
        ...data,
        submissionType: data.submissionType ? data.submissionType as SubmissionType : undefined, // Convert string to enum if provided
      },
      include: {
        submission: true,
        pendingHistories: {
          where: {
            isActive: true
          }
        }
      }
    });
  }

  async delete(id: string) {
    return await prisma.submissionDetail.delete({
      where: { id }
    });
  }
}