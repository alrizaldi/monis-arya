import { NextRequest, NextResponse } from 'next/server';
import { AuditLogRepository } from '@/services/repositories/auditLogRepository';

const auditLogRepo = new AuditLogRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('moduleName');
    const actionType = searchParams.get('actionType');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let auditLogs;

    if (moduleName) {
      auditLogs = await auditLogRepo.findByModule(moduleName);
    } else if (actionType) {
      auditLogs = await auditLogRepo.findByAction(actionType);
    } else if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999); // End of the day
      
      auditLogs = await auditLogRepo.findByDateRange(startDate, endDate);
    } else {
      auditLogs = await auditLogRepo.findAll();
    }

    // Apply pagination
    const paginatedLogs = auditLogs.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedLogs,
      total: auditLogs.length,
      hasNext: offset + limit < auditLogs.length,
      hasPrev: offset > 0
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit logs' }, 
      { status: 500 }
    );
  }
}