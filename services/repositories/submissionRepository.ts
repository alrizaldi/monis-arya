import { PrismaClient, SubmissionStatus } from '@prisma/client';

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

  async findByStatus(status: SubmissionStatus) {
    return await prisma.submission.findMany({
      where: { status },
      include: {
        patient: true,
        payer: true
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
        ...data,
        status: 'DRAFT'
      }
    });
  }

  async update(id: string, data: Partial<{
    submissionNumber: string;
    patientId: string;
    roomId: string;
    payerId: string;
    status: SubmissionStatus;
    submittedAt: Date;
    approvedAt: Date;
    rejectedAt: Date;
  }>) {
    return await prisma.submission.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return await prisma.submission.delete({
      where: { id }
    });
  }

  async updateStatus(id: string, status: SubmissionStatus) {
    const updateData: any = { status };
    
    if (status === 'SUBMITTED') {
      updateData.submittedAt = new Date();
    } else if (status === 'APPROVED') {
      updateData.approvedAt = new Date();
    } else if (status === 'REJECTED') {
      updateData.rejectedAt = new Date();
    }
    
    return await prisma.submission.update({
      where: { id },
      data: updateData
    });
  }
}