import { type SubmissionDetail, SubmissionType } from '@prisma/client';
import prisma from '@/lib/prisma';

// Export the enum for use in other parts of the application
export { SubmissionType };

export class SubmissionDetailRepository {
  async findAll() {
    return await prisma.submissionDetail.findMany({
      include: {
        submission: {
          include: {
            patient: true,
            room: true,
            payer: true
          }
        },
        pendingHistories: true
      }
    });
  }

  async findById(id: string) {
    return await prisma.submissionDetail.findUnique({
      where: { id },
      include: {
        submission: {
          include: {
            patient: true,
            room: true,
            payer: true
          }
        },
        pendingHistories: true
      }
    });
  }

  async findBySubmissionId(submissionId: string) {
    return await prisma.submissionDetail.findMany({
      where: { submissionId },
      include: {
        submission: {
          include: {
            patient: true,
            room: true,
            payer: true
          }
        },
        pendingHistories: true
      }
    });
  }

  async create(data: {
    submissionId: string;
    submissionType: string; // Will be converted to enum
    pengajuan: string;
    note?: string;
  }) {
    return await prisma.submissionDetail.create({
      data: {
        submissionId: data.submissionId,
        submissionType: data.submissionType as SubmissionType, // Convert string to enum
        pengajuan: data.pengajuan,
        note: data.note
      },
      include: {
        submission: {
          include: {
            patient: true,
            room: true,
            payer: true
          }
        }
      }
    });
  }

  async update(id: string, data: Partial<{
    submissionType: string; // Will be converted to enum
    pengajuan: string;
    note?: string;
    status?: string;
    approvedAt?: Date;
    rejectedAt?: Date;
  }>) {
    return await prisma.submissionDetail.update({
      where: { id },
      data: {
        ...data,
        submissionType: data.submissionType ? data.submissionType as SubmissionType : undefined // Convert string to enum if provided
      },
      include: {
        submission: {
          include: {
            patient: true,
            room: true,
            payer: true
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