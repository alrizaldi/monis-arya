import { PrismaClient, Submission } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// 创建一个单一的 PrismaClient 实例
const prisma = new PrismaClient();

export enum SubmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

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
            pendingHistories: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * 根据ID查找提交
   * @param id 提交的唯一标识符
   * @returns 找到的提交记录，如果未找到则返回 null
   */
  async findById(id: string): Promise<Submission | null> {
    return await prisma.submission.findUnique({
      where: { id },
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
    status: SubmissionStatus;
  }>): Promise<Submission> {
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

  /**
   * 更新提交状态
   * @param id 要更新的提交记录的ID
   * @param status 新的状态值
   * @returns 更新后的提交记录
   */
  async updateStatus(id: string, status: SubmissionStatus): Promise<Submission> {
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