// patientService.ts
import { PatientRepository } from "./repositories/patientRepository";
import { AuditLogRepository } from "./repositories/auditLogRepository";

const patientRepo = new PatientRepository();
const auditLogRepo = new AuditLogRepository();

// Helper function to convert string gender to Prisma enum
function convertGender(gender: string): "MALE" | "FEMALE" {
  if (gender.toLowerCase() === "male") return "MALE";
  if (gender.toLowerCase() === "female") return "FEMALE";
  throw new Error(`Invalid gender value: ${gender}`);
}

export interface PatientFilters {
  medicalRecordNumber?: string;
  patientName?: string;
  gender?: string;
  birthDate?: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  filters?: PatientFilters;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PatientService {
  async getAllPatients() {
    return await patientRepo.findAll();
  }

  async getPatientsWithPagination(
    options: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const { page, limit, filters } = options;
    const skip = (page - 1) * limit;

    // Prepare where clause based on filters
    const whereClause: any = {};
    if (filters?.medicalRecordNumber) {
      whereClause.medicalRecordNumber = {
        contains: filters.medicalRecordNumber,
        mode: "insensitive", // case insensitive search
      };
    }
    if (filters?.patientName) {
      whereClause.patientName = {
        contains: filters.patientName,
        mode: "insensitive",
      };
    }
    if (filters?.gender) {
      whereClause.gender = convertGender(filters.gender);
    }
    if (filters?.birthDate) {
      whereClause.birthDate = {
        gte: new Date(new Date(filters.birthDate).setHours(0, 0, 0, 0)),
        lte: new Date(new Date(filters.birthDate).setHours(23, 59, 59, 999)),
      };
    }

    const [patients, totalCount] = await Promise.all([
      patientRepo.findWithPagination(skip, limit, whereClause),
      patientRepo.count(whereClause),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: patients,
      total: totalCount,
      page,
      limit,
      totalPages,
    };
  }

  async getPatientById(id: string) {
    return await patientRepo.findById(id);
  }

  async createPatient(
    data: {
      medicalRecordNumber: string;
      patientName: string;
      gender: string;
      birthDate: Date;
    },
    userEmail: string,
  ) {
    // Check if medical record number already exists
    const existingPatient = await patientRepo.findByMedicalRecordNumber(
      data.medicalRecordNumber,
    );
    if (existingPatient) {
      throw new Error("Patient with this medical record number already exists");
    }

    const patient = await patientRepo.create({
      ...data,
      gender: convertGender(data.gender), // Convert to proper enum value
    });

    // Log the creation
    await auditLogRepo.create({
      moduleName: "Patients",
      actionType: "CREATE_PATIENT",
      referenceId: patient.id,
      description: `Created new patient ${patient.patientName} with MRN ${patient.medicalRecordNumber}`,
      createdBy: userEmail,
    });

    return patient;
  }

  async updatePatient(
    id: string,
    data: {
      medicalRecordNumber: string;
      patientName: string;
      gender: string;
      birthDate: Date;
    },
    userEmail: string,
  ) {
    // Check if medical record number already exists for another patient
    const existingPatient = await patientRepo.findByMedicalRecordNumber(
      data.medicalRecordNumber,
    );
    if (existingPatient && existingPatient.id !== id) {
      throw new Error("Patient with this medical record number already exists");
    }

    const patient = await patientRepo.update(id, {
      ...data,
      gender: convertGender(data.gender), // Convert to proper enum value
    });

    // Log the update
    await auditLogRepo.create({
      moduleName: "Patients",
      actionType: "UPDATE_PATIENT",
      referenceId: patient.id,
      description: `Updated patient ${patient.patientName}`,
      createdBy: userEmail,
    });

    return patient;
  }

  async deletePatient(id: string, userEmail: string) {
    const patient = await patientRepo.findById(id);
    if (!patient) {
      throw new Error("Patient not found");
    }

    await patientRepo.delete(id);

    // Log the deletion
    await auditLogRepo.create({
      moduleName: "Patients",
      actionType: "DELETE_PATIENT",
      referenceId: id,
      description: `Deleted patient ${patient.patientName} with MRN ${patient.medicalRecordNumber}`,
      createdBy: userEmail,
    });
  }
}
