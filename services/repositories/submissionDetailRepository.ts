import { PrismaClient, SubmissionType } from '@prisma/client';
// Removed Decimal import since we're changing to string

const prisma = new PrismaClient();

// Export the enum for use in other parts of the application
export { SubmissionType };

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
        pendingHistories: true
      }
    });
  }

  async create(data: {
    submissionId: string;
    submissionType: string; // Accepting string and converting to enum
    pengajuan: string; // Renamed field
    note?: string;
    status?: string;
    approvedAt?: Date;
    rejectedAt?: Date;
  }) {
    return await prisma.submissionDetail.create({
      data: {
        submissionId: data.submissionId,
        submissionType: data.submissionType as SubmissionType, // Convert string to enum
        pengajuan: data.pengajuan, // Renamed field
        note: data.note,
        status: data.status || 'DRAFT', // Default to DRAFT
        approvedAt: data.approvedAt,
        rejectedAt: data.rejectedAt
      },
      include: {
        submission: true,
        pendingHistories: true
      }
    });
  }

  async update(id: string, data: Partial<{
    submissionType: string; // Accepting string and converting to enum
    pengajuan?: string; // Renamed field
    note?: string;
    status?: string;
    approvedAt?: Date;
    rejectedAt?: Date;
  }>) {
    return await prisma.submissionDetail.update({
      where: { id },
      data: {
        ...data,
        submissionType: data.submissionType ? data.submissionType as SubmissionType : undefined, // Convert string to enum if provided
        pengajuan: data.pengajuan, // Renamed field
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