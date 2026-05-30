import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';

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
      submissionNumber: submissionNumber || undefined,
      patientName: patientName || undefined,
      payerName: payerName || undefined,
      status: status || undefined,
    };

    const result = await submissionService.getSubmissionsWithPagination({
      page,
      limit,
      filters,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch submissions' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const submission = await submissionService.createSubmission({
      submissionNumber: body.submissionNumber,
      patientId: body.patientId,
      roomId: body.roomId,
      payerId: body.payerId
    });
    
    return NextResponse.json(submission, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create submission' }, 
      { status: 500 }
    );
  }
}