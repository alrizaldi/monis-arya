import { type AuditLog } from '@prisma/client';
import prisma from '@/lib/prisma';

export class AuditLogRepository {
  async findAll() {
    return await prisma.auditLog.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findById(id: string) {
    return await prisma.auditLog.findUnique({
      where: { id }
    });
  }

  async findByModule(moduleName: string) {
    return await prisma.auditLog.findMany({
      where: { moduleName },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findByAction(actionType: string) {
    return await prisma.auditLog.findMany({
      where: { actionType },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async create(data: {
    moduleName: string;
    actionType: string;
    referenceId?: string;
    description: string;
    createdBy: string;
    createdAt?: Date;
  }) {
    return await prisma.auditLog.create({
      data: {
        moduleName: data.moduleName,
        actionType: data.actionType,
        referenceId: data.referenceId,
        description: data.description,
        createdBy: data.createdBy,
        createdAt: data.createdAt || new Date()
      }
    });
  }

  async delete(id: string) {
    return await prisma.auditLog.delete({
      where: { id }
    });
  }

  async findWithFiltersAndPagination(
    filters: {
      moduleName?: string;
      actionType?: string;
      searchTerm?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number,
    limit: number
  ) {
    const { moduleName, actionType, searchTerm, startDate, endDate } = filters;
    
    // Build the where clause based on filters
    const whereClause: any = {};
    
    if (moduleName && moduleName !== 'all') {
      whereClause.moduleName = moduleName;
    }
    
    if (actionType && actionType !== 'all') {
      whereClause.actionType = actionType;
    }
    
    if (searchTerm) {
      whereClause.OR = [
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          referenceId: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          createdBy: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        }
      ];
    }
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: new Date(`${endDate.toISOString().split('T')[0]}T23:59:59.999Z`)
      };
    } else if (startDate) {
      whereClause.createdAt = {
        gte: startDate
      };
    } else if (endDate) {
      whereClause.createdAt = {
        lte: new Date(`${endDate.toISOString().split('T')[0]}T23:59:59.999Z`)
      };
    }

    // Get total count
    const total = await prisma.auditLog.count({
      where: whereClause
    });

    // Get paginated results ordered by latest created
    const data = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages
    };
  }

  async countByModule(moduleName: string) {
    return await prisma.auditLog.count({
      where: { moduleName }
    });
  }

  async countByDateRange(startDate: Date, endDate: Date) {
    return await prisma.auditLog.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }
}