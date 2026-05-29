import { PrismaClient, type Patient } from '@prisma/client';

const prisma = new PrismaClient();

export class PatientRepository {
  async findAll() {
    return await prisma.patient.findMany();
  }

  async findById(id: string) {
    return await prisma.patient.findUnique({
      where: { id }
    });
  }

  async findByMedicalRecordNumber(medicalRecordNumber: string) {
    return await prisma.patient.findUnique({
      where: { medicalRecordNumber }
    });
  }

  async create(data: {
    medicalRecordNumber: string;
    patientName: string;
    gender: string;
    birthDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return await prisma.patient.create({
      data: {
        medicalRecordNumber: data.medicalRecordNumber,
        patientName: data.patientName,
        gender: data.gender,
        birthDate: data.birthDate,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date()
      }
    });
  }

  async update(id: string, data: Partial<{
    medicalRecordNumber: string;
    patientName: string;
    gender: string;
    birthDate: Date;
    updatedAt: Date;
  }>) {
    return await prisma.patient.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async delete(id: string) {
    return await prisma.patient.delete({
      where: { id }
    });
  }
}