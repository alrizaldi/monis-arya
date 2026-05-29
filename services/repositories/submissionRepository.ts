import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

/**
 * SubmissionStatus enum represents the possible statuses of a submission.
 */
export enum SubmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

const prisma = new PrismaClient();

export class SubmissionRepository {
  async findAll() {
    return await prisma.submission.findMany({
      include: {
        patient: true,
        room: true,
        payer: true,
        details: {
          include: {
            pendingHistories: {
              where: {
                isActive: true
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
    return await prisma.submission.findUnique({
      where: { id },
      include: {
        patient: true,
        room: true,
        payer: true,
        details: {
          include: {
            pendingHistories: true
          }
        }
      }
    });
  }


  async create(data: {
    submissionNumber: string;
    patientId: string;
    roomId: string;
    payerId: string;
  }) {
    return await prisma.submission.create({
      data: {
        submissionNumber: data.submissionNumber,
        patientId: data.patientId,
        roomId: data.roomId,
        payerId: data.payerId,
        status: 'DRAFT'
      },
      include: {
        patient: true,
        room: true,
        payer: true
      }
    });
  }

  async update(id: string, data: Partial<{
    submissionNumber: string;
    patientId: string;
    roomId: string;
    payerId: string;
    status: SubmissionStatus;
  }>) {
    return await prisma.submission.update({
      where: { id },
      data,
      include: {
        patient: true,
        room: true,
        payer: true
      }
    });
  }

  async delete(id: string) {
    return await prisma.submission.delete({
      where: { id }
    });
  }

  async updateStatus(id: string, status: SubmissionStatus) {
    return await prisma.submission.update({
      where: { id },
      data: { 
        status,
        ...(status === 'SUBMITTED' && { submittedAt: new Date() }),
        ...(status === 'APPROVED' && { approvedAt: new Date() }),
        ...(status === 'REJECTED' && { rejectedAt: new Date() })
      },
      include: {
        patient: true,
        room: true,
        payer: true
      }
    });
  }
}