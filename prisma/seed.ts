import { PrismaClient, SubmissionStatus, SubmissionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

async function main() {
  // Create sample patients
  const patient1 = await prisma.patient.upsert({
    where: { id: 'pat-001' },
    update: {},
    create: {
      id: 'pat-001',
      medicalRecordNumber: 'MRN-001',
      patientName: 'John Doe',
      gender: 'MALE',
      birthDate: new Date('1985-05-15'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { id: 'pat-002' },
    update: {},
    create: {
      id: 'pat-002',
      medicalRecordNumber: 'MRN-002',
      patientName: 'Jane Smith',
      gender: 'FEMALE',
      birthDate: new Date('1990-08-22'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
  });

  // Create sample rooms
  const room1 = await prisma.room.upsert({
    where: { id: 'room-001' },
    update: {},
    create: {
      id: 'room-001',
      roomNumber: '101',
      bedNumber: 1,
      roomClass: 'VIP',
      createdAt: new Date(),
      updatedAt: new Date()
    },
  });

  const room2 = await prisma.room.upsert({
    where: { id: 'room-002' },
    update: {},
    create: {
      id: 'room-002',
      roomNumber: '102',
      bedNumber: 2,
      roomClass: 'GENERAL',
      createdAt: new Date(),
      updatedAt: new Date()
    },
  });

  // Create sample payers
  const payer1 = await prisma.payer.upsert({
    where: { id: 'pay-001' },
    update: {},
    create: {
      id: 'pay-001',
      payerName: 'Aetna Health Insurance',
      createdAt: new Date(),
      updatedAt: new Date()
    },
  });

  const payer2 = await prisma.payer.upsert({
    where: { id: 'pay-002' },
    update: {},
    create: {
      id: 'pay-002',
      payerName: 'Cigna Healthcare',
      createdAt: new Date(),
      updatedAt: new Date()
    },
  });

  // Create sample submissions
  const submission1 = await prisma.submission.upsert({
    where: { id: 'sub-001' },
    update: {},
    create: {
      id: 'sub-001',
      submissionNumber: 'SUB-001',
      patientId: patient1.id,
      roomId: room1.id,
      payerId: payer1.id,
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
  });

  const submission2 = await prisma.submission.upsert({
    where: { id: 'sub-002' },
    update: {},
    create: {
      id: 'sub-002',
      submissionNumber: 'SUB-002',
      patientId: patient2.id,
      roomId: room2.id,
      payerId: payer2.id,
      status: SubmissionStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date()
    },
  });

  // Create sample submission details for submission1
  const detail1 = await prisma.submissionDetail.create({
    data: {
      id: 'sd-001',
      submissionId: submission1.id,
      submissionType: SubmissionType.ROOM,
      pengajuan: 'Rp 1,500,000',
      note: 'Standard room charge for 3 days',
      status: 'SUBMITTED',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  const detail2 = await prisma.submissionDetail.create({
    data: {
      id: 'sd-002',
      submissionId: submission1.id,
      submissionType: SubmissionType.MEDICINE,
      pengajuan: 'Rp 250,500',
      note: 'Prescription medication',
      status: 'SUBMITTED',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  const detail3 = await prisma.submissionDetail.create({
    data: {
      id: 'sd-003',
      submissionId: submission1.id,
      submissionType: SubmissionType.LAB,
      pengajuan: 'Rp 300,750',
      note: 'Blood test lab work',
      status: 'SUBMITTED',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Create pending history for some details
  await prisma.pendingHistory.create({
    data: {
      id: 'ph-001',
      submissionDetailId: detail1.id,
      pendingType: 'AUTHORIZATION_REQUIRED',
      pendingNote: 'Requires prior authorization from insurance',
      createdAt: new Date(),
      resolvedAt: null,
      isActive: true
    }
  });

  await prisma.pendingHistory.create({
    data: {
      id: 'ph-002',
      submissionDetailId: detail2.id,
      pendingType: 'DOCUMENTATION_MISSING',
      pendingNote: 'Missing prescription documentation',
      createdAt: new Date(),
      resolvedAt: new Date(),
      isActive: false
    }
  });

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        id: 'al-001',
        moduleName: 'Patients',
        actionType: 'CREATE_PATIENT',
        referenceId: patient1.id,
        description: `Created patient ${patient1.patientName}`,
        createdBy: 'system',
        createdAt: new Date()
      },
      {
        id: 'al-002',
        moduleName: 'Rooms',
        actionType: 'CREATE_ROOM',
        referenceId: room1.id,
        description: `Created room ${room1.roomNumber}`,
        createdBy: 'system',
        createdAt: new Date()
      },
      {
        id: 'al-003',
        moduleName: 'Submissions',
        actionType: 'CREATE_SUBMISSION',
        referenceId: submission1.id,
        description: `Created submission ${submission1.submissionNumber}`,
        createdBy: 'system',
        createdAt: new Date()
      },
      {
        id: 'al-004',
        moduleName: 'Pending',
        actionType: 'ADD_PENDING',
        referenceId: detail1.id,
        description: `Added pending record for detail in submission ${submission1.submissionNumber}`,
        createdBy: 'system',
        createdAt: new Date()
      },
      {
        id: 'al-005',
        moduleName: 'Pending',
        actionType: 'RESOLVE_PENDING',
        referenceId: detail2.id,
        description: `Resolved pending record for detail in submission ${submission1.submissionNumber}`,
        createdBy: 'system',
        createdAt: new Date()
      }
    ]
  });

  console.log('Seed data created successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });