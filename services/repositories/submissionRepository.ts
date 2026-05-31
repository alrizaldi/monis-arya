import { type Submission, SubmissionStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

// Export the enum for use in other parts of the application
export { SubmissionStatus };

/**
 * SubmissionRepository 类用于管理提交记录
 * 使用单一的 PrismaClient 实例确保数据库操作的一致性
 */
export class SubmissionRepository {
  async findAll() {
    return await prisma.submission.findMany({
      include: {
        patient: true,
        room: true,
        payer: true,
        details: {
          include: {
            pendingHistories: true // Show all pending histories, both active and inactive
          }
        }
      }
    });
  }

  async findWithPagination(skip: number, limit: number, whereClause: any = {}) {
    return await prisma.submission.findMany({
      skip,
      take: limit,
      where: whereClause,
      include: {
        patient: true,
        room: true,
        payer: true,
        details: {
          include: {
            pendingHistories: true // Show all pending histories, both active and inactive
          }
        }
      },
      orderBy: {
        createdAt: 'desc', // Sort by creation date descending by default
      },
    });
  }

  async count(whereClause: any = {}) {
    return await prisma.submission.count({
      where: whereClause,
    });
  }

  /**
   * 根据ID查找提交
   * @param id 提交的唯一标识符
   * @returns 找到的提交记录，如果未找到则返回 null
   */
  async findById(id: string) {
    return await prisma.submission.findUnique({
      where: { id },
      include: {
        patient: true,
        room: true,
        payer: true,
        details: {
          include: {
            pendingHistories: true // Show all pending histories, both active and inactive
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
        payerId: data.payerId
      },
      include: {
        patient: true,
        room: true,
        payer: true
      }
    });
  }

  /**
   * 更新提交记录
   * @param id 要更新的提交记录的ID
   * @param data 包含要更新数据的 Partial 对象
   * @returns 更新后的提交记录
   */
  async update(id: string, data: Partial<{
    submissionNumber: string;
    patientId: string;
    roomId: string;
    payerId: string;
    status: string; // Accepting string and converting to enum
  }>) {
    return await prisma.submission.update({
      where: { id },
      data: {
        ...data,
        status: data.status ? data.status as SubmissionStatus : undefined, // Convert string to enum if provided
      },
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

  /**
   * 更新提交状态
   * @param id 要更新的提交记录的ID
   * @param status 新的状态值
   * @returns 更新后的提交记录
   */
  async updateStatus(id: string, status: string): Promise<Submission> {
    // Map status to appropriate timestamp
    const updateData: any = { status: status as SubmissionStatus }; // Convert string to enum
    
    switch(status) {
      case 'SUBMITTED':
        updateData.submittedAt = new Date();
        break;
      case 'APPROVED':
        updateData.approvedAt = new Date();
        break;
      case 'REJECTED':
        updateData.rejectedAt = new Date();
        break;
    }
    
    return await prisma.submission.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        room: true,
        payer: true
      }
    });
  }

  async findWithDateRange(startDate: Date, endDate: Date) {
    return await prisma.submission.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        patient: true,
        room: true,
        payer: true
      }
    });
  }
}