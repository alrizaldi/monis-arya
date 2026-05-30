import { NextRequest, NextResponse } from 'next/server';
import { PatientService } from '@/services/patientService';

const patientService = new PatientService();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const medicalRecordNumber = url.searchParams.get('medicalRecordNumber') || '';
    const patientName = url.searchParams.get('patientName') || '';
    const gender = url.searchParams.get('gender') || '';
    const birthDate = url.searchParams.get('birthDate') || '';

    const filters = {
      medicalRecordNumber: medicalRecordNumber || undefined,
      patientName: patientName || undefined,
      gender: gender || undefined,
      birthDate: birthDate ? new Date(birthDate) : undefined,
    };

    const result = await patientService.getPatientsWithPagination({
      page,
      limit,
      filters,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch patients' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const patient = await patientService.createPatient({
      medicalRecordNumber: body.medicalRecordNumber,
      patientName: body.patientName,
      gender: body.gender,
      birthDate: new Date(body.birthDate)
    });
    
    return NextResponse.json(patient, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create patient' }, 
      { status: 500 }
    );
  }
}