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
    
    let auditLogs;
    
    if (moduleName) {
      auditLogs = await auditLogRepo.findByModule(moduleName);
    } else if (actionType) {
      auditLogs = await auditLogRepo.findByAction(actionType);
    } else if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      auditLogs = await auditLogRepo.findByDateRange(startDate, endDate);
    } else {
      auditLogs = await auditLogRepo.findAll();
    }
    
    return NextResponse.json(auditLogs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' }, 
      { status: 500 }
    );
  }
}