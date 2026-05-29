import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  // Create sample patients
  const patient1 = await prisma.patient.upsert({
    where: { medicalRecordNumber: 'MR-001' },
    update: {},
    create: {
      medicalRecordNumber: 'MR-001',
      patientName: 'John Doe',
      gender: 'Male',
      birthDate: new Date('1985-05-15'),
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { medicalRecordNumber: 'MR-002' },
    update: {},
    create: {
      medicalRecordNumber: 'MR-002',
      patientName: 'Jane Smith',
      gender: 'Female',
      birthDate: new Date('1990-08-22'),
    },
  });

  const patient3 = await prisma.patient.upsert({
    where: { medicalRecordNumber: 'MR-003' },
    update: {},
    create: {
      medicalRecordNumber: 'MR-003',
      patientName: 'Robert Johnson',
      gender: 'Male',
      birthDate: new Date('1978-12-03'),
    },
  });

  // Create sample rooms
  const room1 = await prisma.room.upsert({
    where: { roomNumber: '101' },
    update: {},
    create: {
      roomNumber: '101',
      bedNumber: 1,
      roomClass: 'VIP',
    },
  });

  const room2 = await prisma.room.upsert({
    where: { roomNumber: '102' },
    update: {},
    create: {
      roomNumber: '102',
      bedNumber: 2,
      roomClass: 'Regular',
    },
  });

  const room3 = await prisma.room.upsert({
    where: { roomNumber: '201' },
    update: {},
    create: {
      roomNumber: '201',
      bedNumber: 1,
      roomClass: 'ICU',
    },
  });

  // Create sample payers
  const payer1 = await prisma.payer.upsert({
    where: { payerName: 'BPJS Kesehatan' },
    update: {},
    create: {
      payerName: 'BPJS Kesehatan',
    },
  });

  const payer2 = await prisma.payer.upsert({
    where: { payerName: 'Asuransi Swasta A' },
    update: {},
    create: {
      payerName: 'Asuransi Swasta A',
    },
  });

  const payer3 = await prisma.payer.upsert({
    where: { payerName: 'Asuransi Swasta B' },
    update: {},
    create: {
      payerName: 'Asuransi Swasta B',
    },
  });

  // Create sample submissions
  const submission1 = await prisma.submission.upsert({
    where: { submissionNumber: 'SUB-001' },
    update: {},
    create: {
      submissionNumber: 'SUB-001',
      patientId: patient1.id,
      roomId: room1.id,
      payerId: payer1.id,
      status: 'APPROVED',
      submittedAt: new Date('2023-05-01T10:00:00Z'),
      approvedAt: new Date('2023-05-01T14:00:00Z'),
    },
  });

  const submission2 = await prisma.submission.upsert({
    where: { submissionNumber: 'SUB-002' },
    update: {},
    create: {
      submissionNumber: 'SUB-002',
      patientId: patient2.id,
      roomId: room2.id,
      payerId: payer2.id,
      status: 'PENDING',
      submittedAt: new Date('2023-05-02T09:00:00Z'),
    },
  });

  const submission3 = await prisma.submission.upsert({
    where: { submissionNumber: 'SUB-003' },
    update: {},
    create: {
      submissionNumber: 'SUB-003',
      patientId: patient3.id,
      roomId: room3.id,
      payerId: payer1.id,
      status: 'REJECTED',
      submittedAt: new Date('2023-05-03T11:00:00Z'),
      rejectedAt: new Date('2023-05-03T16:00:00Z'),
    },
  });

  // Create sample submission details
  const detail1 = await prisma.submissionDetail.create({
    data: {
      submissionId: submission1.id,
      submissionType: 'ROOM',
      submissionValue: new Decimal('1500000'),
      note: 'VIP room charge for 3 days'
    }
  });

  const detail2 = await prisma.submissionDetail.create({
    data: {
      submissionId: submission1.id,
      submissionType: 'MEDICINE',
      submissionValue: new Decimal('250000'),
      note: 'Prescription medications'
    }
  });

  const detail3 = await prisma.submissionDetail.create({
    data: {
      submissionId: submission1.id,
      submissionType: 'LAB',
      submissionValue: new Decimal('300000'),
      note: 'Complete blood count test'
    }
  });

  const detail4 = await prisma.submissionDetail.create({
    data: {
      submissionId: submission2.id,
      submissionType: 'PROCEDURE',
      submissionValue: new Decimal('5000000'),
      note: 'MRI scan'
    }
  });

  const detail5 = await prisma.submissionDetail.create({
    data: {
      submissionId: submission2.id,
      submissionType: 'MEDICINE',
      submissionValue: new Decimal('180000'),
      note: 'Post-procedure medications'
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
  await prisma.auditLog.create({
    data: {
      moduleName: 'Submissions',
      actionType: 'CREATE_SUBMISSION',
      referenceId: submission1.id,
      description: `Created new submission ${submission1.submissionNumber} for patient ${patient1.patientName}`,
      createdBy: 'seed-script'
    }
  });

  await prisma.auditLog.create({
    data: {
      moduleName: 'Submissions',
      actionType: 'SUBMIT_SUBMISSION',
      referenceId: submission1.id,
      description: `Submitted submission ${submission1.submissionNumber}`,
      createdBy: 'seed-script'
    }
  });

  await prisma.auditLog.create({
    data: {
      moduleName: 'Submissions',
      actionType: 'APPROVE_SUBMISSION',
      referenceId: submission1.id,
      description: `Approved submission ${submission1.submissionNumber}`,
      createdBy: 'seed-script'
    }
  });

  await prisma.auditLog.create({
    data: {
      moduleName: 'Submissions',
      actionType: 'CREATE_SUBMISSION',
      referenceId: submission2.id,
      description: `Created new submission ${submission2.submissionNumber} for patient ${patient2.patientName}`,
      createdBy: 'seed-script'
    }
  });

  await prisma.auditLog.create({
    data: {
      moduleName: 'Pending',
      actionType: 'ADD_PENDING',
      referenceId: submission2.id,
      description: `Added pending record for procedure authorization`,
      createdBy: 'seed-script'
    }
  });

  console.log({
    patient1: patient1,
    patient2: patient2,
    patient3: patient3,
    room1: room1,
    room2: room2,
    room3: room3,
    payer1: payer1,
    payer2: payer2,
    payer3: payer3,
    submission1: submission1,
    submission2: submission2,
    submission3: submission3,
  });
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