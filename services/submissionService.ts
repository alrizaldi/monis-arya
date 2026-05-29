import { SubmissionRepository } from './repositories/submissionRepository';
import { SubmissionDetailRepository } from './repositories/submissionDetailRepository';
import { PendingHistoryRepository } from './repositories/pendingHistoryRepository';
import { AuditLogRepository } from './repositories/auditLogRepository';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

const submissionRepo = new SubmissionRepository();
const submissionDetailRepo = new SubmissionDetailRepository();
const pendingHistoryRepo = new PendingHistoryRepository();
const auditLogRepo = new AuditLogRepository();

export class SubmissionService {
  async getAllSubmissions() {
    return await submissionRepo.findAll();
  }

  async getSubmissionById(id: string) {
    return await submissionRepo.findById(id);
  }

  async createSubmission(data: {
    submissionNumber: string;
    patientId: string;
    roomId: string;
    payerId: string;
  }) {
    const submission = await submissionRepo.create(data);
    
    // Log the creation
    await auditLogRepo.create({
      moduleName: 'Submissions',
      actionType: 'CREATE_SUBMISSION',
      referenceId: submission.id,
      description: `Created new submission ${submission.submissionNumber}`,
      createdBy: 'system' // In real app, this would come from auth context
    });
    
    return submission;
  }

  async updateSubmission(id: string, data: Partial<{
    submissionNumber: string;
    patientId: string;
    roomId: string;
    payerId: string;
    status: Prisma.SubmissionStatus;
  }>) {
    const submission = await submissionRepo.update(id, data);
    
    // Log the update
    await auditLogRepo.create({
      moduleName: 'Submissions',
      actionType: 'UPDATE_SUBMISSION',
      referenceId: submission.id,
      description: `Updated submission ${submission.submissionNumber}`,
      createdBy: 'system' // In real app, this would come from auth context
    });
    
    return submission;
  }

  async submitSubmission(id: string) {
    const submission = await submissionRepo.updateStatus(id, Prisma.SubmissionStatus.SUBMITTED);
    
    // Log the submission
    await auditLogRepo.create({
      moduleName: 'Submissions',
      actionType: 'SUBMIT_SUBMISSION',
      referenceId: submission.id,
      description: `Submitted submission ${submission.submissionNumber}`,
      createdBy: 'system' // In real app, this would come from auth context
    });
    
    return submission;
  }

  async approveSubmission(id: string) {
    const submission = await submissionRepo.updateStatus(id, Prisma.SubmissionStatus.APPROVED);
    
    // Log the approval
    await auditLogRepo.create({
      moduleName: 'Submissions',
      actionType: 'APPROVE_SUBMISSION',
      referenceId: submission.id,
      description: `Approved submission ${submission.submissionNumber}`,
      createdBy: 'system' // In real app, this would come from auth context
    });
    
    return submission;
  }

  async rejectSubmission(id: string) {
    const submission = await submissionRepo.updateStatus(id, Prisma.SubmissionStatus.REJECTED);
    
    // Log the rejection
    await auditLogRepo.create({
      moduleName: 'Submissions',
      actionType: 'REJECT_SUBMISSION',
      referenceId: submission.id,
      description: `Rejected submission ${submission.submissionNumber}`,
      createdBy: 'system' // In real app, this would come from auth context
    });
    
    return submission;
  }

  async deleteSubmission(id: string) {
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
      createdBy: 'system' // In real app, this would come from auth context
    });
  }

  async addSubmissionDetail(submissionId: string, data: {
    submissionType: string;
    submissionValue: number;
    note?: string;
  }) {
    const detail = await submissionDetailRepo.create({
      submissionId,
      submissionType: data.submissionType, // Pass the string directly, repository handles conversion
      submissionValue: new Decimal(data.submissionValue.toString()),
      note: data.note
    });
    
    // Check if submission should be marked as PENDING due to active pending records
    await this._updateSubmissionStatusBasedOnPending(submissionId);
    
    return detail;
  }

  async addPendingRecord(submissionDetailId: string, data: {
    pendingType: string;
    pendingNote?: string;
  }) {
    const pending = await pendingHistoryRepo.create({
      submissionDetailId,
      pendingType: data.pendingType,
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
        createdBy: 'system' // In real app, this would come from auth context
      });
    }
    
    return pending;
  }

  async resolvePendingRecord(pendingId: string) {
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
        description: `Resolved pending record for submission detail in submission ${submissionDetail.submission.submission.submissionNumber}`,
        createdBy: 'system' // In real app, this would come from auth context
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
      await submissionRepo.updateStatus(submissionId, Prisma.SubmissionStatus.PENDING);
    } else {
      // Don't change status if it's already approved/rejected
      const submission = await submissionRepo.findById(submissionId);
      if (submission && ![Prisma.SubmissionStatus.APPROVED, Prisma.SubmissionStatus.REJECTED].includes(submission.status)) {
        // If no active pending, but status was PENDING, change to SUBMITTED
        if (submission.status === Prisma.SubmissionStatus.PENDING) {
          await submissionRepo.updateStatus(submissionId, Prisma.SubmissionStatus.SUBMITTED);
        }
      }
    }
  }
}