import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';
import { getUserFromRequest } from '@/lib/authUtils';

const submissionService = new SubmissionService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; detailId: string } }
) {
  try {
    const detail = await submissionService.getSubmissionDetailById(params.detailId);
    
    if (!detail) {
      return NextResponse.json({ error: 'Submission detail not found' }, { status: 404 });
    }
    
    return NextResponse.json(detail);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch submission detail' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; detailId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Prepare update data with only provided fields
    const updateData: Partial<{
      submissionType: string;
      pengajuan: string;
      note?: string;
    }> = {};
    
    if (body.submissionType !== undefined) {
      updateData.submissionType = body.submissionType;
    }
    if (body.pengajuan !== undefined) {
      updateData.pengajuan = body.pengajuan;
    }
    if (body.note !== undefined) {
      updateData.note = body.note;
    }
    
    const detail = await submissionService.updateSubmissionDetail(params.detailId, updateData, user.email);
    
    return NextResponse.json(detail, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update submission detail' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; detailId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (body.action === 'approve') {
      const detail = await submissionService.approveSubmissionDetail(params.detailId, user.email);
      return NextResponse.json(detail, { status: 200 });
    } else if (body.action === 'reject') {
      const detail = await submissionService.rejectSubmissionDetail(params.detailId, user.email);
      return NextResponse.json(detail, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update submission detail status' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; detailId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await submissionService.deleteSubmissionDetail(params.detailId, user.email);
    
    return NextResponse.json({ message: 'Submission detail deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete submission detail' }, 
      { status: 500 }
    );
  }
}