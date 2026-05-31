import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';
import { getUserFromRequest } from '@/lib/authUtils';

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
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Handle different types of updates
    if (body.action === 'submit') {
      const submission = await submissionService.submitSubmission(params.id, user.email);
      return NextResponse.json(submission);
    } else if (body.action === 'approve') {
      const submission = await submissionService.approveSubmission(params.id, user.email);
      return NextResponse.json(submission);
    } else if (body.action === 'reject') {
      const submission = await submissionService.rejectSubmission(params.id, user.email);
      return NextResponse.json(submission);
    } else {
      // Regular update
      const submission = await submissionService.updateSubmission(params.id, {
        submissionNumber: body.submissionNumber,
        patientId: body.patientId,
        roomId: body.roomId,
        payerId: body.payerId,
        status: body.status
      }, user.email);
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
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await submissionService.deleteSubmission(params.id, user.email);
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
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    let submission;
    switch (action) {
      case 'submit':
        submission = await submissionService.submitSubmission(params.id, user.email);
        break;
      case 'approve':
        submission = await submissionService.approveSubmission(params.id, user.email);
        break;
      case 'reject':
        submission = await submissionService.rejectSubmission(params.id, user.email);
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