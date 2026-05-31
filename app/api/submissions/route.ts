import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';
import { getUserFromRequest } from '@/lib/authUtils';

const submissionService = new SubmissionService();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const submissionNumber = url.searchParams.get('submissionNumber') || '';
    const patientName = url.searchParams.get('patientName') || '';
    const payerName = url.searchParams.get('payerName') || '';
    const status = url.searchParams.get('status') || '';


    const filters = {
      submissionNumber: submissionNumber.trim() || undefined,
      patientName: patientName.trim() || undefined,
      payerName: payerName.trim() || undefined,
      status: status.trim() || undefined,
    };

    const result = await submissionService.getSubmissionsWithPagination({
      page,
      limit,
      filters,
    });


    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in GET /api/submissions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch submissions' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const submission = await submissionService.createSubmission({
      submissionNumber: body.submissionNumber,
      patientId: body.patientId,
      roomId: body.roomId,
      payerId: body.payerId
    }, user.email);
    
    return NextResponse.json(submission, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create submission' }, 
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

    const url = new URL(request.url);
    const submissionId = url.pathname.split('/').pop(); // Extract ID from URL
    
    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    // Handle different types of updates
    if (body.action === 'submit') {
      const submission = await submissionService.submitSubmission(submissionId, user.email);
      return NextResponse.json(submission);
    } else if (body.action === 'approve') {
      const submission = await submissionService.approveSubmission(submissionId, user.email);
      return NextResponse.json(submission);
    } else if (body.action === 'reject') {
      const submission = await submissionService.rejectSubmission(submissionId, user.email);
      return NextResponse.json(submission);
    } else {
      // Regular update
      const submission = await submissionService.updateSubmission(
        submissionId,
        {
          submissionNumber: body.submissionNumber,
          patientId: body.patientId,
          roomId: body.roomId,
          payerId: body.payerId,
          status: body.status,
        },
        user.email
      );
      return NextResponse.json(submission);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update submission' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const submissionId = url.pathname.split('/').pop(); // Extract ID from URL
    
    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    await submissionService.deleteSubmission(submissionId, user.email);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete submission' }, 
      { status: 500 }
    );
  }
}