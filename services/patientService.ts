import { PatientRepository } from './repositories/patientRepository';

const patientRepo = new PatientRepository();

export class PatientService {
  async getAllPatients() {
    return await patientRepo.findAll();
  }

  async getPatientById(id: string) {
    return await patientRepo.findById(id);
  }

  async createPatient(data: {
    medicalRecordNumber: string;
    patientName: string;
    gender: string;
    birthDate: Date;
  }) {
    // Check if medical record number already exists
    const existingPatient = await patientRepo.findByMedicalRecordNumber(data.medicalRecordNumber);
    if (existingPatient) {
      throw new Error('Patient with this medical record number already exists');
    }
    
    return await patientRepo.create(data);
  }

  async updatePatient(id: string, data: {
    medicalRecordNumber: string;
    patientName: string;
    gender: string;
    birthDate: Date;
  }) {
    // Check if medical record number already exists for another patient
    const existingPatient = await patientRepo.findByMedicalRecordNumber(data.medicalRecordNumber);
    if (existingPatient && existingPatient.id !== id) {
      throw new Error('Patient with this medical record number already exists');
    }
    
    return await patientRepo.update(id, data);
  }

  async deletePatient(id: string) {
    return await patientRepo.delete(id);
  }
}