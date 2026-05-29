import { PrismaClient, SubmissionType } from '@prisma/client';

const prisma = new PrismaClient();

export class SubmissionDetailRepository {
  async findAll() {
    return await prisma.submissionDetail.findMany({
      include: {
        submission: true,
        pendingHistories: true
      },
      orderBy: {
        createdAt: 'desc'
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
        pendingHistories: true
      }
    });
  }

  async create(data: {
    submissionId: string;
    submissionType: SubmissionType;
    submissionValue: number;
    note?: string;
  }) {
    return await prisma.submissionDetail.create({
      data
    });
  }

  async update(id: string, data: Partial<{
    submissionType: SubmissionType;
    submissionValue: number;
    note: string;
  }>) {
    return await prisma.submissionDetail.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return await prisma.submissionDetail.delete({
      where: { id }
    });
  }
}