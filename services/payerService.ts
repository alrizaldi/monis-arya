import { PayerRepository } from './repositories/payerRepository';
import { AuditLogRepository } from './repositories/auditLogRepository';

const payerRepo = new PayerRepository();
const auditLogRepo = new AuditLogRepository();

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
  }, userEmail: string) {
    const payer = await payerRepo.create(data);
    
    // Log the creation
    await auditLogRepo.create({
      moduleName: 'Payers',
      actionType: 'CREATE_PAYER',
      referenceId: payer.id,
      description: `Created new payer ${payer.payerName}`,
      createdBy: userEmail
    });
    
    return payer;
  }

  async updatePayer(id: string, data: {
    payerName: string;
  }, userEmail: string) {
    const payer = await payerRepo.update(id, data);
    
    // Log the update
    await auditLogRepo.create({
      moduleName: 'Payers',
      actionType: 'UPDATE_PAYER',
      referenceId: payer.id,
      description: `Updated payer ${payer.payerName}`,
      createdBy: userEmail
    });
    
    return payer;
  }

  async deletePayer(id: string, userEmail: string) {
    const payer = await payerRepo.findById(id);
    if (!payer) {
      throw new Error('Payer not found');
    }
    
    await payerRepo.delete(id);
    
    // Log the deletion
    await auditLogRepo.create({
      moduleName: 'Payers',
      actionType: 'DELETE_PAYER',
      referenceId: id,
      description: `Deleted payer ${payer.payerName}`,
      createdBy: userEmail
    });
  }
}