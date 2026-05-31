import { 
  SubmissionRepository, 
  SubmissionStatus 
} from './repositories/submissionRepository';
import { SubmissionDetailRepository, SubmissionType } from './repositories/submissionDetailRepository';
import { PendingHistoryRepository } from './repositories/pendingHistoryRepository';
import { AuditLogRepository } from './repositories/auditLogRepository';
import { Decimal } from '@prisma/client/runtime/library';

const submissionRepo = new SubmissionRepository();
const submissionDetailRepo = new SubmissionDetailRepository();
const pendingHistoryRepo = new PendingHistoryRepository();
const auditLogRepo = new AuditLogRepository();

export interface SubmissionFilters {
  submissionNumber?: string;
  patientName?: string;
  payerName?: string;
  status?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  filters?: SubmissionFilters;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SubmissionService {
  async getAllSubmissions() {
    return await submissionRepo.findAll();
  }

  async getSubmissionsWithPagination(options: PaginationOptions): Promise<PaginatedResult<any>> {
    const { page, limit, filters } = options;
    const skip = (page - 1) * limit;

    // Prepare where clause based on filters
    const whereClause: any = {};
    if (filters?.submissionNumber) {
      whereClause.submissionNumber = {
        contains: filters.submissionNumber,
        mode: 'insensitive', // case insensitive search
      };
    }
    if (filters?.patientName) {
      whereClause.patient = {
        patientName: {
          contains: filters.patientName,
          mode: 'insensitive',
        }
      };
    }
    if (filters?.payerName) {
      whereClause.payer = {
        payerName: {
          contains: filters.payerName,
          mode: 'insensitive',
        }
      };
    }
    if (filters?.status) {
      whereClause.status = filters.status;
    }

    const [submissions, totalCount] = await Promise.all([
      submissionRepo.findWithPagination(skip, limit, whereClause),
      submissionRepo.count(whereClause),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: submissions,
      total: totalCount,
      page,
      limit,
      totalPages,
    };
  }

  // New method to get pending records with filters and pagination
  async getPendingRecordsWithFilters(
    isActive?: boolean,
    searchTerm?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<any>> {
    const skip = (page - 1) * limit;
    
    // Build where clause based on filters
    const whereClause: any = {};
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }
    
    if (searchTerm) {
      whereClause.OR = [
        {
          pendingType: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          pendingNote: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          submissionDetail: {
            submission: {
              submissionNumber: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          submissionDetail: {
            submission: {
              patient: {
                patientName: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
        {
          submissionDetail: {
            submission: {
              payer: {
                payerName: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      ];
    }

    const [pendingRecords, totalCount] = await Promise.all([
      pendingHistoryRepo.findWithWhereClause(whereClause, skip, limit),
      pendingHistoryRepo.countWithWhereClause(whereClause),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: pendingRecords,
      total: totalCount,
      page,
      limit,
      totalPages,
    };
  }

  async getSubmissionById(id: string) {
    return await submissionRepo.findById(id);
  }

  async createSubmission(data: {
    submissionNumber: string;
    patientId: string;
    roomId: string;
    payerId: string;
  }, userEmail: string) {
    const submission = await submissionRepo.create(data);
    
    // Log the creation
    await auditLogRepo.create({
      moduleName: 'Submissions',
      actionType: 'CREATE_SUBMISSION',
      referenceId: submission.id,
      description: `Created new submission ${submission.submissionNumber}`,
      createdBy: userEmail
    });
    
    return submission;
  }

  async updateSubmission(id: string, data: Partial<{
    submissionNumber: string;
    patientId: string;
    roomId: string;
    payerId: string;
    status: SubmissionStatus;
  }>, userEmail: string) {
    const submission = await submissionRepo.update(id, data);
    
    // Log the update
    await auditLogRepo.create({
      moduleName: 'Submissions',
      actionType: 'UPDATE_SUBMISSION',
      referenceId: submission.id,
      description: `Updated submission ${submission.submissionNumber}`,
      createdBy: userEmail
    });
    
    return submission;
  }

  async submitSubmission(id: string, userEmail: string) {
    const submission = await submissionRepo.updateStatus(id, SubmissionStatus.SUBMITTED);
    
    // Log the submission
    await auditLogRepo.create({
      moduleName: 'Submissions',
      actionType: 'SUBMIT_SUBMISSION',
      referenceId: submission.id,
      description: `Submitted submission ${submission.submissionNumber}`,
      createdBy: userEmail
    });
    
    return submission;
  }

  async approveSubmission(id: string, userEmail: string) {
    const submission = await submissionRepo.updateStatus(id, SubmissionStatus.APPROVED);
    
    // Log the approval
    await auditLogRepo.create({
      moduleName: 'Submissions',
      actionType: 'APPROVE_SUBMISSION',
      referenceId: submission.id,
      description: `Approved submission ${submission.submissionNumber}`,
      createdBy: userEmail
    });
    
    return submission;
  }

  async rejectSubmission(id: string, userEmail: string) {
    const submission = await submissionRepo.updateStatus(id, SubmissionStatus.REJECTED);
    
    // Log the rejection
    await auditLogRepo.create({
      moduleName: 'Submissions',
      actionType: 'REJECT_SUBMISSION',
      referenceId: submission.id,
      description: `Rejected submission ${submission.submissionNumber}`,
      createdBy: userEmail
    });
    
    return submission;
  }

  async deleteSubmission(id: string, userEmail: string) {
    const submission = await submissionRepo.findById(id);
    if (!submission) {
      throw new Error('Submission not found');
    }
    
    await submissionRepo.delete(id);
    
    // Log the deletion
    await auditLogRepo.create({
      moduleName: 'Submissions',
      actionType: 'DELETE_SUBMISSION',
      referenceId: id,
      description: `Deleted submission ${submission.submissionNumber}`,
      createdBy: userEmail
    });
  }

  async addSubmissionDetail(submissionId: string, data: {
    submissionType: string;
    pengajuan: string; // Renamed from submissionValue
    note?: string;
  }, userEmail: string) {
    const detail = await submissionDetailRepo.create({
      submissionId,
      submissionType: data.submissionType,
      pengajuan: data.pengajuan, // Renamed field
      note: data.note
    });
    
    // Check if submission should be marked as PENDING due to active pending records
    await this._updateSubmissionStatusBasedOnPending(submissionId);
    
    // Log the addition
    await auditLogRepo.create({
      moduleName: 'Submissions',
      actionType: 'ADD_SUBMISSION_DETAIL',
      referenceId: detail.id,
      description: `Added submission detail to submission ${detail.submission.submissionNumber}`,
      createdBy: userEmail
    });
    
    return detail;
  }

  async getSubmissionDetailById(id: string) {
    return await submissionDetailRepo.findById(id);
  }

  async updateSubmissionDetail(id: string, data: Partial<{
    submissionType: string;
    pengajuan: string; // Renamed from submissionValue
    note?: string;
    status?: string;
    approvedAt?: Date;
    rejectedAt?: Date;
  }>, userEmail: string) {
    const detail = await submissionDetailRepo.update(id, {
      submissionType: data.submissionType,
      pengajuan: data.pengajuan, // Renamed field
      note: data.note,
      status: data.status,
      approvedAt: data.approvedAt,
      rejectedAt: data.rejectedAt
    });
    
    if (detail) {
      // Log the update
      await auditLogRepo.create({
        moduleName: 'Submissions',
        actionType: 'UPDATE_SUBMISSION_DETAIL',
        referenceId: detail.id,
        description: `Updated submission detail in submission ${detail.submission.submissionNumber}`,
        createdBy: userEmail
      });
    
      // Check if submission should be marked as PENDING due to active pending records
      await this._updateSubmissionStatusBasedOnPending(detail.submissionId);
    }
    
    return detail;
  }

  async deleteSubmissionDetail(id: string, userEmail: string) {
    const detail = await submissionDetailRepo.findById(id);
    if (!detail) {
      throw new Error('Submission detail not found');
    }
    
    await submissionDetailRepo.delete(id);
    
    // Check if submission should be marked as PENDING due to active pending records
    await this._updateSubmissionStatusBasedOnPending(detail.submissionId);
    
    // Log the deletion
    await auditLogRepo.create({
      moduleName: 'Submissions',
      actionType: 'DELETE_SUBMISSION_DETAIL',
      referenceId: detail.submissionId,
      description: `Deleted submission detail from submission ${detail.submission.submissionNumber}`,
      createdBy: userEmail
    });
  }

  async approveSubmissionDetail(detailId: string, userEmail: string) {
    const detail = await submissionDetailRepo.update(detailId, {
      status: 'APPROVED',
      approvedAt: new Date()
    });
    
    // Update submission status based on all details
    if (detail) {
      await this._updateSubmissionStatusBasedOnDetails(detail.submissionId);
      
      // Log the approval
      await auditLogRepo.create({
        moduleName: 'Submissions',
        actionType: 'APPROVE_SUBMISSION_DETAIL',
        referenceId: detailId,
        description: `Approved submission detail in submission ${detail.submission.submissionNumber}`,
        createdBy: userEmail
      });
    }
    
    return detail;
  }

  async rejectSubmissionDetail(detailId: string, userEmail: string) {
    const detail = await submissionDetailRepo.update(detailId, {
      status: 'REJECTED',
      rejectedAt: new Date()
    });
    
    // Update submission status based on all details
    if (detail) {
      await this._updateSubmissionStatusBasedOnDetails(detail.submissionId);
      
      // Log the rejection
      await auditLogRepo.create({
        moduleName: 'Submissions',
        actionType: 'REJECT_SUBMISSION_DETAIL',
        referenceId: detailId,
        description: `Rejected submission detail in submission ${detail.submission.submissionNumber}`,
        createdBy: userEmail
      });
    }
    
    return detail;
  }

  async addPendingRecord(submissionDetailId: string, data: {
    pendingType: string;
    pendingNote?: string;
  }, userEmail: string) {
    const pending = await pendingHistoryRepo.create({
      submissionDetailId,
      pendingType: data.pendingType, // Use string directly, no enum conversion needed
      pendingNote: data.pendingNote
    });
    
    // Find the submission detail and its parent submission
    const submissionDetail = await submissionDetailRepo.findById(submissionDetailId);
    if (submissionDetail) {
      // Update submission status based on pending records
      await this._updateSubmissionStatusBasedOnPending(submissionDetail.submissionId);
      
      // Log the pending addition
      await auditLogRepo.create({
        moduleName: 'Pending',
        actionType: 'ADD_PENDING',
        referenceId: submissionDetail.submissionId,
        description: `Added pending record for submission detail in submission ${submissionDetail.submission.submissionNumber}`,
        createdBy: userEmail
      });
    }
    
    return pending;
  }

  async resolvePendingRecord(pendingId: string, userEmail: string) {
    const pending = await pendingHistoryRepo.resolvePending(pendingId);
    
    // Find the submission detail and its parent submission
    const submissionDetail = await submissionDetailRepo.findById(pending.submissionDetailId);
    if (submissionDetail) {
      // Update submission status based on pending records
      await this._updateSubmissionStatusBasedOnPending(submissionDetail.submissionId);
      
      // Log the pending resolution
      await auditLogRepo.create({
        moduleName: 'Pending',
        actionType: 'RESOLVE_PENDING',
        referenceId: submissionDetail.submissionId,
        description: `Resolved pending record for submission detail in submission ${submissionDetail.submission.submissionNumber}`,
        createdBy: userEmail
      });
    }
    
    return pending;
  }

  private async _updateSubmissionStatusBasedOnPending(submissionId: string) {
    // Get all details for this submission
    const details = await submissionDetailRepo.findBySubmissionId(submissionId);
    
    // Check if any detail has active pending records
    let hasActivePending = false;
    for (const detail of details) {
      const activePending = detail.pendingHistories.filter(ph => ph.isActive);
      if (activePending.length > 0) {
        hasActivePending = true;
        break;
      }
    }
    
    // Update submission status accordingly
    if (hasActivePending) {
      await submissionRepo.updateStatus(submissionId, SubmissionStatus.PENDING);
    } else {
      // Don't change status if it's already approved/rejected
      const submission = await submissionRepo.findById(submissionId);
      if (submission && !['APPROVED', 'REJECTED'].includes(submission.status)) {
        // If no active pending, but status was PENDING, change to SUBMITTED
        if (submission.status === SubmissionStatus.PENDING) {
          await submissionRepo.updateStatus(submissionId, SubmissionStatus.SUBMITTED);
        }
      }
    }
  }

  private async _updateSubmissionStatusBasedOnDetails(submissionId: string) {
    // Get all details for this submission
    const details = await submissionDetailRepo.findBySubmissionId(submissionId);
    
    // Check if any detail has active pending records
    let hasActivePending = false;
    let hasUnapproved = false;
    
    for (const detail of details) {
      const activePending = detail.pendingHistories.filter(ph => ph.isActive);
      if (activePending.length > 0) {
        hasActivePending = true;
        break;
      }
      
      // Check if detail is not approved
      if (detail.status !== 'APPROVED') {
        hasUnapproved = true;
      }
    }
    
    // Determine overall submission status
    let newStatus: SubmissionStatus;
    if (hasActivePending) {
      newStatus = SubmissionStatus.PENDING;
    } else if (hasUnapproved) {
      // If there are unapproved details but no pending, submission is still submitted for review
      newStatus = SubmissionStatus.SUBMITTED;
    } else {
      // All details approved
      newStatus = SubmissionStatus.APPROVED;
    }
    
    // Update submission status
    await submissionRepo.updateStatus(submissionId, newStatus);
  }
}