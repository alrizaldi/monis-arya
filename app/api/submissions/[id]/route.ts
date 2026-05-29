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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const submission = await submissionService.updateSubmission(params.id, {
      submissionNumber: body.submissionNumber,
      patientId: body.patientId,
      roomId: body.roomId,
      payerId: body.payerId,
      status: body.status
    });
    
    return NextResponse.json(submission);
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete submission' }, 
      { status: 500 }
    );
  }
}

// Handle submission actions (submit, approve, reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const action = body.action;

    let submission;
    switch (action) {
      case 'submit':
        submission = await submissionService.submitSubmission(params.id);
        break;
      case 'approve':
        submission = await submissionService.approveSubmission(params.id);
        break;
      case 'reject':
        submission = await submissionService.rejectSubmission(params.id);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' }, 
          { status: 400 }
        );
    }

    return NextResponse.json(submission);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to perform action' }, 
      { status: 500 }
    );
  }
}