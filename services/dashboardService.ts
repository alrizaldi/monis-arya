import { PatientRepository } from './repositories/patientRepository';
import { RoomRepository } from './repositories/roomRepository';
import { PayerRepository } from './repositories/payerRepository';
import { SubmissionRepository } from './repositories/submissionRepository';
import { SubmissionDetailRepository } from './repositories/submissionDetailRepository';
import { PendingHistoryRepository } from './repositories/pendingHistoryRepository';
import { AuditLogRepository } from './repositories/auditLogRepository';

const patientRepo = new PatientRepository();
const roomRepo = new RoomRepository();
const payerRepo = new PayerRepository();
const submissionRepo = new SubmissionRepository();
const submissionDetailRepo = new SubmissionDetailRepository();
const pendingHistoryRepo = new PendingHistoryRepository();
const auditLogRepo = new AuditLogRepository();

export interface DashboardStats {
  totalPatients: number;
  totalRooms: number;
  totalPayers: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  totalPendingRecords: number;
  activePendingRecords: number;
}

export interface RecentActivity {
  id: string;
  moduleName: string;
  actionType: string;
  description: string;
  createdBy: string;
  createdAt: string; // Changed to string to match what the frontend expects
}

export interface SubmissionTrend {
  date: string;
  submissions: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface ModuleActivity {
  name: string;
  count: number;
}

export class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalPatients,
      totalRooms,
      totalPayers,
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      totalPendingRecords,
      activePendingRecords
    ] = await Promise.all([
      patientRepo.count({}),
      roomRepo.count({}),
      payerRepo.count({}),
      submissionRepo.count({}),
      submissionRepo.count({ status: 'PENDING' }),
      submissionRepo.count({ status: 'APPROVED' }),
      submissionRepo.count({ status: 'REJECTED' }),
      pendingHistoryRepo.countWithWhereClause({}),
      pendingHistoryRepo.countWithWhereClause({ isActive: true })
    ]);

    return {
      totalPatients,
      totalRooms,
      totalPayers,
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      totalPendingRecords,
      activePendingRecords
    };
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const activities = await auditLogRepo.findAll();
    return activities.slice(0, limit).map(activity => ({
      id: activity.id,
      moduleName: activity.moduleName,
      actionType: activity.actionType,
      description: activity.description,
      createdBy: activity.createdBy,
      createdAt: activity.createdAt.toISOString() // Convert to ISO string for frontend
    }));
  }

  async getSubmissionTrends(days: number = 7): Promise<SubmissionTrend[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get submissions grouped by date
    const submissions = await submissionRepo.findWithDateRange(startDate, endDate);
    
    // Group submissions by date
    const dateMap = new Map<string, { submissions: number; approved: number; pending: number; rejected: number }>();
    
    for (const submission of submissions) {
      const dateStr = submission.createdAt.toISOString().split('T')[0];
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { submissions: 0, approved: 0, pending: 0, rejected: 0 });
      }
      
      const dayData = dateMap.get(dateStr)!;
      dayData.submissions += 1;
      
      switch (submission.status) {
        case 'APPROVED':
          dayData.approved += 1;
          break;
        case 'PENDING':
          dayData.pending += 1;
          break;
        case 'REJECTED':
          dayData.rejected += 1;
          break;
      }
    }
    
    // Generate data for the past 'days' days
    const trends: SubmissionTrend[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = dateMap.get(dateStr) || { submissions: 0, approved: 0, pending: 0, rejected: 0 };
      
      trends.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        submissions: dayData.submissions,
        approved: dayData.approved,
        pending: dayData.pending,
        rejected: dayData.rejected
      });
    }
    
    return trends;
  }

  async getModuleActivity(): Promise<ModuleActivity[]> {
    // Count audit logs by module
    const modules = ['Patients', 'Submissions', 'Pending', 'Rooms', 'Payers'];
    const activityCounts: ModuleActivity[] = [];
    
    for (const module of modules) {
      const count = await auditLogRepo.countByModule(module);
      activityCounts.push({
        name: module,
        count
      });
    }
    
    return activityCounts;
  }

  async getDashboardData(): Promise<{
    stats: DashboardStats;
    recentActivity: RecentActivity[];
    submissionTrends: SubmissionTrend[];
    moduleActivity: ModuleActivity[];
  }> {
    const [stats, recentActivity, submissionTrends, moduleActivity] = await Promise.all([
      this.getDashboardStats(),
      this.getRecentActivity(5),
      this.getSubmissionTrends(7),
      this.getModuleActivity()
    ]);

    return {
      stats,
      recentActivity,
      submissionTrends,
      moduleActivity
    };
  }
}