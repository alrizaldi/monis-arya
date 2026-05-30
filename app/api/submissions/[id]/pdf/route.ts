import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';

const submissionService = new SubmissionService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submission = await submissionService.getSubmissionById(params.id);
    
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    return NextResponse.json(submission);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch submission' }, 
      { status: 500 }
    );
  }
}