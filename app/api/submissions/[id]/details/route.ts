import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';
import { getUserFromRequest } from '@/lib/authUtils';

const submissionService = new SubmissionService();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const detail = await submissionService.addSubmissionDetail(params.id, {
      submissionType: body.submissionType,
      pengajuan: body.pengajuan, // Using renamed field
      note: body.note
    }, user.email);
    
    return NextResponse.json(detail, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add submission detail' }, 
      { status: 500 }
    );
  }
}