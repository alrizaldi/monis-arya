import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';
import { getUserFromRequest } from '@/lib/authUtils';

const submissionService = new SubmissionService();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status') || ''; // 'active', 'resolved', or empty for all
    const searchTerm = url.searchParams.get('search') || '';

    // Determine isActive filter
    let isActiveFilter: boolean | undefined = undefined;
    if (status === 'active') {
      isActiveFilter = true;
    } else if (status === 'resolved') {
      isActiveFilter = false;
    }

    const result = await submissionService.getPendingRecordsWithFilters(
      isActiveFilter,
      searchTerm,
      page,
      limit
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pending records' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const pending = await submissionService.resolvePendingRecord(body.id, user.email);
    return NextResponse.json(pending);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to resolve pending record' }, 
      { status: 500 }
    );
  }
}