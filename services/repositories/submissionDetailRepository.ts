import { PrismaClient, SubmissionType as PrismaSubmissionType, type SubmissionDetail } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export { PrismaSubmissionType as SubmissionType };

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
        pendingHistories: true
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
        submissionType: data.submissionType as PrismaSubmissionType, // Convert string to enum
        submissionValue: data.submissionValue,
        note: data.note
      },
      include: {
        submission: true,
        pendingHistories: true
      }
    });
  }

  async update(id: string, data: Partial<{
    submissionType: PrismaSubmissionType;
    submissionValue: Decimal;
    note?: string;
  }>) {
    return await prisma.submissionDetail.update({
      where: { id },
      data,
      include: {
        submission: true,
        pendingHistories: true
      }
    });
  }

  async delete(id: string) {
    return await prisma.submissionDetail.delete({
      where: { id }
    });
  }
}