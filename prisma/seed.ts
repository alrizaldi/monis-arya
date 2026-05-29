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
      medical_record_number: 'MRN-001',
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: new Date('1985-05-15'),
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
      medical_record_number: 'MRN-002',
      first_name: 'Jane',
      last_name: 'Smith',
      date_of_birth: new Date('1990-08-22'),
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
      room_number: '101',
      bed_number: 'A1',
      room_class: 'VIP'
    },
  });

  const room2 = await prisma.room.upsert({
    where: { id: 'room-002' },
    update: {},
    create: {
      id: 'room-002',
      room_number: '102',
      bed_number: 'A2',
      room_class: 'GENERAL'
    },
  });

  // Create sample payers
  const payer1 = await prisma.payer.upsert({
    where: { id: 'pay-001' },
    update: {},
    create: {
      id: 'pay-001',
      payer_code: 'AETNA',
      payer_name: 'Aetna Health Insurance',
      contact_person: 'Michael Johnson',
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
      payer_code: 'CIGNA',
      payer_name: 'Cigna Healthcare',
      contact_person: 'Sarah Williams',
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
      submission_number: 'SUB-001',
      patient_id: patient1.id,
      room_id: room1.id,
      payer_id: payer1.id,
      status: 'SUBMITTED'
    },
  });

  const submission2 = await prisma.submission.upsert({
    where: { id: 'sub-002' },
    update: {},
    create: {
      id: 'sub-002',
      submission_number: 'SUB-002',
      patient_id: patient2.id,
      room_id: room2.id,
      payer_id: payer2.id,
      status: 'DRAFT'
    },
  });

  // Create sample submission details for submission1
  const detail1 = await prisma.submissionDetail.create({
    data: {
      id: 'sd-001',
      submission_id: submission1.id,
      submission_type: 'ROOM_CHARGE',
      submission_value: new Decimal(1500.00),
      note: 'Standard room charge for 3 days'
    }
  });

  const detail2 = await prisma.submissionDetail.create({
    data: {
      id: 'sd-002',
      submission_id: submission1.id,
      submission_type: 'MEDICINE',
      submission_value: new Decimal(250.50),
      note: 'Prescription medication'
    }
  });

  const detail3 = await prisma.submissionDetail.create({
    data: {
      id: 'sd-003',
      submission_id: submission1.id,
      submission_type: 'LAB',
      submission_value: new Decimal(300.75),
      note: 'Blood test lab work'
    }
  });

  // Create pending history for some details
  await prisma.pendingHistory.create({
    data: {
      id: 'ph-001',
      submission_detail_id: detail1.id,
      pending_type: 'AUTHORIZATION_REQUIRED',
      pending_note: 'Requires prior authorization from insurance',
      resolved_at: null,
      is_active: true
    }
  });

  await prisma.pendingHistory.create({
    data: {
      id: 'ph-002',
      submission_detail_id: detail2.id,
      pending_type: 'DOCUMENTATION_MISSING',
      pending_note: 'Missing prescription documentation',
      resolved_at: new Date(),
      is_active: false
    }
  });

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        id: 'al-001',
        module_name: 'Patients',
        action_type: 'CREATE_PATIENT',
        reference_id: patient1.id,
        description: `Created patient ${patient1.first_name} ${patient1.last_name}`,
        created_by: 'system'
      },
      {
        id: 'al-002',
        module_name: 'Rooms',
        action_type: 'CREATE_ROOM',
        reference_id: room1.id,
        description: `Created room ${room1.room_number}`,
        created_by: 'system'
      },
      {
        id: 'al-003',
        module_name: 'Submissions',
        action_type: 'CREATE_SUBMISSION',
        reference_id: submission1.id,
        description: `Created submission ${submission1.submission_number}`,
        created_by: 'system'
      },
      {
        id: 'al-004',
        module_name: 'Pending',
        action_type: 'ADD_PENDING',
        reference_id: detail1.id,
        description: `Added pending record for detail in submission ${submission1.submission_number}`,
        created_by: 'system'
      },
      {
        id: 'al-005',
        module_name: 'Pending',
        action_type: 'RESOLVE_PENDING',
        reference_id: detail2.id,
        description: `Resolved pending record for detail in submission ${submission1.submission_number}`,
        created_by: 'system'
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