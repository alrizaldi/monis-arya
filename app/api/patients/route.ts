import { NextRequest, NextResponse } from 'next/server';
import { PatientService } from '@/services/patientService';

const patientService = new PatientService();

export async function GET(request: NextRequest) {
  try {
    const patients = await patientService.getAllPatients();
    return NextResponse.json(patients);
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