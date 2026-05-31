'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';

// Define AuditLog type
type AuditLog = {
  id: string;
  moduleName: string;
  actionType: string;
  referenceId?: string;
  description: string;
  createdBy: string;
  createdAt: Date;
};

// Define paginated result type
type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    moduleName: 'all',
    actionType: 'all',
    searchTerm: '',
    startDate: '',
    endDate: ''
  });
  
  // Temporary filter values for input fields
  const [tempFilters, setTempFilters] = useState({
    moduleName: 'all',
    actionType: 'all',
    searchTerm: '',
    startDate: '',
    endDate: ''
  });

  // Get unique modules and actions for filters (we'll fetch these dynamically later)
  const [uniqueModules, setUniqueModules] = useState<string[]>([]);
  const [uniqueActions, setUniqueActions] = useState<string[]>([]);

  // Load audit logs from API with pagination and filters
  useEffect(() => {
    const loadAuditLogs = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        
        if (filters.moduleName && filters.moduleName !== 'all') {
          queryParams.append('moduleName', filters.moduleName);
        }
        if (filters.actionType && filters.actionType !== 'all') {
          queryParams.append('actionType', filters.actionType);
        }
        if (filters.searchTerm) {
          queryParams.append('searchTerm', filters.searchTerm);
        }
        if (filters.startDate) {
          queryParams.append('startDate', filters.startDate);
        }
        if (filters.endDate) {
          queryParams.append('endDate', filters.endDate);
        }

        const response = await fetch(`/api/audit?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch audit logs');
        }
        const result: PaginatedResult<AuditLog> = await response.json();
        
        setAuditLogs(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit
        });
      } catch (error) {
        console.error("Error loading audit logs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();
  }, [pagination.page, filters]);

  // Load unique modules and actions for filter dropdowns
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // We'll get unique values by fetching all logs initially
        // In a real app, you might want to have separate API endpoints for this
        const response = await fetch('/api/audit?page=1&limit=1');
        if (!response.ok) {
          throw new Error('Failed to fetch audit logs for filter options');
        }
        const result: PaginatedResult<AuditLog> = await response.json();
        
        // Since we're limiting to 1, we need to get all unique values differently
        // For now, we'll hardcode some common modules and actions based on typical usage
        setUniqueModules(['Submissions', 'Pending', 'Patients', 'Rooms', 'Payers']);
        setUniqueActions(['CREATE_SUBMISSION', 'ADD_PENDING', 'APPROVE_SUBMISSION', 'REJECT_SUBMISSION', 'RESOLVE_PENDING', 'CREATE_PATIENT', 'UPDATE_ROOM', 'CREATE_PAYER']);
      } catch (error) {
        console.error("Error loading filter options:", error);
        // Fallback to default values
        setUniqueModules(['Submissions', 'Pending', 'Patients', 'Rooms', 'Payers']);
        setUniqueActions(['CREATE_SUBMISSION', 'ADD_PENDING', 'APPROVE_SUBMISSION', 'REJECT_SUBMISSION', 'RESOLVE_PENDING', 'CREATE_PATIENT', 'UPDATE_ROOM', 'CREATE_PAYER']);
      }
    };

    loadFilterOptions();
  }, []);

  const handleFilterChange = (field: keyof typeof tempFilters, value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    // Apply temporary filters to actual filters
    setFilters(tempFilters);
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleClearFilters = () => {
    // Clear all filters
    const clearedFilters = {
      moduleName: 'all',
      actionType: 'all',
      searchTerm: '',
      startDate: '',
      endDate: ''
    };
    
    setTempFilters(clearedFilters);
    setFilters(clearedFilters);
    // Reset to first page
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
      </div>
      
      {/* Filters - with button approach */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="filter-search">Search</Label>
            <div className="relative mt-1">
              <Input
                id="filter-search"
                placeholder="Search logs..."
                value={tempFilters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="filter-module">Module</Label>
            <select
              id="filter-module"
              value={tempFilters.moduleName}
              onChange={(e) => handleFilterChange('moduleName', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Modules</option>
              {uniqueModules.map(module => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="filter-action">Action</Label>
            <select
              id="filter-action"
              value={tempFilters.actionType}
              onChange={(e) => handleFilterChange('actionType', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="filter-start-date">Start Date</Label>
            <input
              type="date"
              id="filter-start-date"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={tempFilters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="filter-end-date">End Date</Label>
            <input
              type="date"
              id="filter-end-date"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={tempFilters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2 mt-4">
          <Button 
            type="button" 
            onClick={handleApplyFilters}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Search className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Reference ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date & Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.moduleName}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {log.actionType}
                    </span>
                  </TableCell>
                  <TableCell>{log.referenceId || '-'}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{log.createdBy}</TableCell>
                  <TableCell>{dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  No audit logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                let pageNum;
                
                if (pagination.totalPages <= 5) {
                  // Show all pages if total pages is 5 or less
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  // Show first 5 pages if current page is near the beginning
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  // Show last 5 pages if current page is near the end
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  // Show 2 pages before and after current page
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={pagination.page === pageNum ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}