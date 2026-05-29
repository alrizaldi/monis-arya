import { PayerRepository } from './repositories/payerRepository';

const payerRepo = new PayerRepository();

export class PayerService {
  async getAllPayers() {
    return await payerRepo.findAll();
  }

  async getPayerById(id: string) {
    return await payerRepo.findById(id);
  }

  async createPayer(data: {
    payerName: string;
  }) {
    return await payerRepo.create(data);
  }

  async updatePayer(id: string, data: {
    payerName: string;
  }) {
    return await payerRepo.update(id, data);
  }

  async deletePayer(id: string) {
    return await payerRepo.delete(id);
  }
}