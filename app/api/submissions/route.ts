import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/services/submissionService';

const submissionService = new SubmissionService();

export async function GET(request: NextRequest) {
  try {
    const submissions = await submissionService.getAllSubmissions();
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch submissions' }, 
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