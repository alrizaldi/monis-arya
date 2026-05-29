import { PrismaClient, SubmissionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  // Create sample patients
  const patient1 = await prisma.patient.upsert({
    where: { id: 'pat-001' },
    update: {},
    create: {
      id: 'pat-001',
      medicalRecordNumber: 'MRN-001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'MALE',
      phone: '+1234567890',
      email: 'john.doe@example.com',
      address: '123 Main St, New York, NY'
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { id: 'pat-002' },
    update: {},
    create: {
      id: 'pat-002',
      medicalRecordNumber: 'MRN-002',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: new Date('1990-08-22'),
      gender: 'FEMALE',
      phone: '+1987654321',
      email: 'jane.smith@example.com',
      address: '456 Oak Ave, Los Angeles, CA'
    },
  });

  // Create sample rooms
  const room1 = await prisma.room.upsert({
    where: { id: 'room-001' },
    update: {},
    create: {
      id: 'room-001',
      roomNumber: '101',
      bedNumber: 'A1',
      roomClass: 'VIP'
    },
  });

  const room2 = await prisma.room.upsert({
    where: { id: 'room-002' },
    update: {},
    create: {
      id: 'room-002',
      roomNumber: '102',
      bedNumber: 'A2',
      roomClass: 'GENERAL'
    },
  });

  // Create sample payers
  const payer1 = await prisma.payer.upsert({
    where: { id: 'pay-001' },
    update: {},
    create: {
      id: 'pay-001',
      payerCode: 'AETNA',
      payerName: 'Aetna Health Insurance',
      contactPerson: 'Michael Johnson',
      phone: '+1555123456',
      email: 'contact@aetna.com',
      address: '789 Insurance Blvd, Hartford, CT'
    },
  });

  const payer2 = await prisma.payer.upsert({
    where: { id: 'pay-002' },
    update: {},
    create: {
      id: 'pay-002',
      payerCode: 'CIGNA',
      payerName: 'Cigna Healthcare',
      contactPerson: 'Sarah Williams',
      phone: '+1555987654',
      email: 'info@cigna.com',
      address: '321 Health St, Bloomfield, CT'
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
      status: 'SUBMITTED' as SubmissionStatus,
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
      status: 'DRAFT' as SubmissionStatus,
    },
  });

  // Create sample submission details for submission1
  const detail1 = await prisma.submissionDetail.create({
    data: {
      id: 'sd-001',
      submissionId: submission1.id,
      submissionType: 'ROOM_CHARGE',
      submissionValue: new Decimal(1500.00),
      note: 'Standard room charge for 3 days'
    }
  });

  const detail2 = await prisma.submissionDetail.create({
    data: {
      id: 'sd-002',
      submissionId: submission1.id,
      submissionType: 'MEDICINE',
      submissionValue: new Decimal(250.50),
      note: 'Prescription medication'
    }
  });

  const detail3 = await prisma.submissionDetail.create({
    data: {
      id: 'sd-003',
      submissionId: submission1.id,
      submissionType: 'LAB',
      submissionValue: new Decimal(300.75),
      note: 'Blood test lab work'
    }
  });

  // Create sample pending histories
  await prisma.pendingHistory.create({
    data: {
      submissionDetailId: detail4.id,
      pendingType: 'Authorization Required',
      pendingNote: 'Additional authorization needed for MRI scan',
      isActive: true,
      createdAt: new Date('2023-05-02T10:00:00Z'),
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
        description: `Created patient ${patient1.firstName} ${patient1.lastName}`,
        createdBy: 'system'
      },
      {
        id: 'al-002',
        moduleName: 'Rooms',
        actionType: 'CREATE_ROOM',
        referenceId: room1.id,
        description: `Created room ${room1.roomNumber}`,
        createdBy: 'system'
      },
      {
        id: 'al-003',
        moduleName: 'Submissions',
        actionType: 'CREATE_SUBMISSION',
        referenceId: submission1.id,
        description: `Created submission ${submission1.submissionNumber}`,
        createdBy: 'system'
      },
      {
        id: 'al-004',
        moduleName: 'Pending',
        actionType: 'ADD_PENDING',
        referenceId: detail1.id,
        description: `Added pending record for detail in submission ${submission1.submissionNumber}`,
        createdBy: 'system'
      },
      {
        id: 'al-005',
        moduleName: 'Pending',
        actionType: 'RESOLVE_PENDING',
        referenceId: detail2.id,
        description: `Resolved pending record for detail in submission ${submission1.submissionNumber}`,
        createdBy: 'system'
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