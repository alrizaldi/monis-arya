import { PayerRepository } from './repositories/payerRepository';

const payerRepo = new PayerRepository();

export interface PayerFilters {
  payerName?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  filters?: PayerFilters;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PayerService {
  async getAllPayers() {
    return await payerRepo.findAll();
  }

  async getPayersWithPagination(options: PaginationOptions): Promise<PaginatedResult<any>> {
    const { page, limit, filters } = options;
    const skip = (page - 1) * limit;

    // Prepare where clause based on filters
    const whereClause: any = {};
    if (filters?.payerName) {
      whereClause.payerName = {
        contains: filters.payerName,
        mode: 'insensitive', // case insensitive search
      };
    }

    const [payers, totalCount] = await Promise.all([
      payerRepo.findWithPagination(skip, limit, whereClause),
      payerRepo.count(whereClause),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: payers,
      total: totalCount,
      page,
      limit,
      totalPages,
    };
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