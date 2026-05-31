import { NextRequest, NextResponse } from "next/server";
import { PatientService } from "@/services/patientService";
import { getUserFromRequest } from '@/lib/authUtils';

const patientService = new PatientService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const patient = await patientService.getPatientById(params.id);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch patient" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const patient = await patientService.updatePatient(params.id, {
      medicalRecordNumber: body.medicalRecordNumber,
      patientName: body.patientName,
      gender: body.gender,
      birthDate: new Date(body.birthDate),
    }, user.email);

    return NextResponse.json(patient);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update patient" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await patientService.deletePatient(params.id, user.email);
    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete patient" },
      { status: 500 },
    );
  }
}