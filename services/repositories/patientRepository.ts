import { type Patient, Gender } from '@prisma/client';
import prisma from '@/lib/prisma';

// Export the enum for use in other parts of the application
export { Gender };

export class PatientRepository {
  async findAll() {
    return await prisma.patient.findMany();
  }

  async findWithPagination(skip: number, limit: number, whereClause: any = {}) {
    return await prisma.patient.findMany({
      skip,
      take: limit,
      where: whereClause,
      orderBy: {
        createdAt: 'desc', // Sort by creation date descending by default
      },
    });
  }

  async count(whereClause: any = {}) {
    return await prisma.patient.count({
      where: whereClause,
    });
  }

  /**
   * Count patients by gender
   * @param gender The gender to filter by
   * @returns The number of patients of the specified gender
   */
  async countByGender(gender: Gender) {
    return await prisma.patient.count({
      where: {
        gender: gender
      }
    });
  }

  /**
   * Count patients created in the last specified number of days
   * @param days Number of days to look back
   * @returns The number of patients created in the last 'days' days
   */
  async countRecentPatients(days: number) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return await prisma.patient.count({
      where: {
        createdAt: {
          gte: date
        }
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
    gender: string; // Will be converted to enum
    birthDate: Date;
  }) {
    return await prisma.patient.create({
      data: {
        medicalRecordNumber: data.medicalRecordNumber,
        patientName: data.patientName,
        gender: data.gender as Gender, // Convert string to enum
        birthDate: data.birthDate
      }
    });
  }

  async update(id: string, data: {
    medicalRecordNumber: string;
    patientName: string;
    gender: string; // Will be converted to enum
    birthDate: Date;
  }) {
    return await prisma.patient.update({
      where: { id },
      data: {
        medicalRecordNumber: data.medicalRecordNumber,
        patientName: data.patientName,
        gender: data.gender as Gender, // Convert string to enum
        birthDate: data.birthDate
      }
    });
  }

  async delete(id: string) {
    return await prisma.patient.delete({
      where: { id }
    });
  }
}