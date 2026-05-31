import { NextRequest, NextResponse } from 'next/server';
import { AuditLogRepository } from '@/services/repositories/auditLogRepository';

const auditLogRepo = new AuditLogRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('moduleName') || 'all';
    const actionType = searchParams.get('actionType') || 'all';
    const searchTerm = searchParams.get('searchTerm') || '';
    const startDateStr = searchParams.get('startDate') || '';
    const endDateStr = searchParams.get('endDate') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Convert date strings to Date objects if they exist
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    // Call the new paginated method with filters
    const result = await auditLogRepo.findWithFiltersAndPagination(
      {
        moduleName: moduleName !== 'all' ? moduleName : undefined,
        actionType: actionType !== 'all' ? actionType : undefined,
        searchTerm: searchTerm || undefined,
        startDate,
        endDate
      },
      page,
      limit
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit logs' }, 
      { status: 500 }
    );
  }
}