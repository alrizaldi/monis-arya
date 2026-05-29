import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PatientRepository {
  async findAll() {
    return await prisma.patient.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
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
  }) {
    return await prisma.patient.create({
      data
    });
  }

  async update(id: string, data: {
    medicalRecordNumber: string;
    patientName: string;
    gender: string;
    birthDate: Date;
  }) {
    return await prisma.patient.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return await prisma.patient.delete({
      where: { id }
    });
  }
}