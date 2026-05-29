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
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch submission' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    if (body.action === 'submit') {
      const submission = await submissionService.submitSubmission(params.id);
      return NextResponse.json(submission);
    } else if (body.action === 'approve') {
      const submission = await submissionService.approveSubmission(params.id);
      return NextResponse.json(submission);
    } else if (body.action === 'reject') {
      const submission = await submissionService.rejectSubmission(params.id);
      return NextResponse.json(submission);
    } else {
      const submission = await submissionService.updateSubmission(params.id, {
        submissionNumber: body.submissionNumber,
        patientId: body.patientId,
        roomId: body.roomId,
        payerId: body.payerId
      });
      
      return NextResponse.json(submission);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update submission' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await submissionService.deleteSubmission(params.id);
    return NextResponse.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete submission' }, 
      { status: 500 }
    );
  }
}