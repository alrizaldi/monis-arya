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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search, Filter, Clock, CheckCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

// Define schema for pending form validation
const pendingSchema = z.object({
  submissionNumber: z.string().min(1, 'Submission Number is required'),
  patient: z.string().min(1, 'Patient is required'),
  pendingType: z.string().min(1, 'Pending Type is required'),
});

type PendingFormValues = z.infer<typeof pendingSchema>;

// Define types for pending records
type PendingRecord = {
  id: string;
  pendingType: string;
  pendingNote?: string;
  isActive: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  submissionDetail: {
    submission: {
      submissionNumber: string;
      patient: {
        patientName: string;
      };
      payer: {
        payerName: string;
      };
    };
  };
};

type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function PendingPage() {
  const [paginatedPendingRecords, setPaginatedPendingRecords] = useState<PaginatedResult<PendingRecord>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPending, setEditingPending] = useState<any>(null);
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  
  // Temporary filter values for input fields
  const [tempFilters, setTempFilters] = useState({
    status: 'all',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PendingFormValues>({
    resolver: zodResolver(pendingSchema),
  });

  // Function to export pending records to Excel
  const handleExportExcel = async () => {
    try {
      // Fetch pending records with the same filters that are currently applied
      const queryParams = new URLSearchParams({
        limit: '10000', // Using a high limit to get all matching records
      });
      
      // Add active filters to the query params
      if (filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }

      const response = await fetch(`/api/pending?${queryParams}`, {
        credentials: 'include' // Include credentials (cookies) in the request
      });
      if (!response.ok) {
        throw new Error('Failed to fetch pending records for export');
      }

      const allPendingRecords = await response.json();

      // Format data for Excel export
      const formattedData = allPendingRecords.data.map((record: any) => {
        const createdDate = new Date(record.createdAt);
        const currentDate = new Date();
        const durationInDays = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          'ID': record.id,
          'Submission Number': record.submissionDetail.submission.submissionNumber,
          'Patient': record.submissionDetail.submission.patient.patientName,
          'Payer': record.submissionDetail.submission.payer.payerName,
          'Pending Type': record.pendingType,
          'Pending Note': record.pendingNote || '',
          'Created Date': createdDate.toLocaleDateString(),
          'Duration (Days)': durationInDays,
          'Status': record.isActive ? 'Active' : 'Resolved',
          'Resolved At': record.resolvedAt ? new Date(record.resolvedAt).toLocaleDateString() : '',
          'Created At': new Date(record.createdAt).toLocaleDateString(),
          'Updated At': new Date(record.updatedAt).toLocaleDateString(),
        };
      });

      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pending Records');

      // Generate and download Excel file with timestamp
      XLSX.writeFile(
        workbook,
        `pending_records_export_${new Date().toISOString().split("T")[0]}_${Date.now()}.xlsx`,
      );
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export pending records to Excel. Please try again.');
    }
  };

  // Fetch pending records from API with pagination and filters
  useEffect(() => {
    const loadPendingRecords = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: paginatedPendingRecords.page.toString(),
          limit: paginatedPendingRecords.limit.toString(),
        });
        
        if (filters.status !== 'all') {
          queryParams.append('status', filters.status);
        }
        if (filters.search) {
          queryParams.append('search', filters.search);
        }

        const response = await fetch(`/api/pending?${queryParams}`, {
          credentials: 'include' // Include credentials (cookies) in the request
        });
        if (!response.ok) {
          throw new Error('Failed to fetch pending records');
        }
        const result: PaginatedResult<PendingRecord> = await response.json();
        
        setPaginatedPendingRecords(result);
      } catch (error) {
        console.error("Error loading pending records:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPendingRecords();
  }, [paginatedPendingRecords.page, filters]);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= paginatedPendingRecords.totalPages) {
      setPaginatedPendingRecords(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const response = await fetch('/api/pending', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials (cookies) in the request
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to resolve pending record');
      }

      // Refresh the list
      const queryParams = new URLSearchParams({
        page: paginatedPendingRecords.page.toString(),
        limit: paginatedPendingRecords.limit.toString(),
      });
      
      if (filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.search) {
        queryParams.append('search', filters.search);
      }

      const refreshResponse = await fetch(`/api/pending?${queryParams}`, {
        credentials: 'include' // Include credentials (cookies) in the request
      });
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh pending records');
      }
      const result: PaginatedResult<PendingRecord> = await refreshResponse.json();
      
      setPaginatedPendingRecords(result);
    } catch (error) {
      console.error('Error resolving pending record:', error);
    }
  };

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
    setPaginatedPendingRecords(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleClearFilters = () => {
    // Clear all filters
    setTempFilters({
      status: 'all',
      search: ''
    });
    setFilters({
      status: 'all',
      search: ''
    });
    // Reset to first page
    setPaginatedPendingRecords(prev => ({
      ...prev,
      page: 1
    }));
  };

  const filteredPendingRecords = paginatedPendingRecords.data;

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Pending Monitoring</h1>
        <Button
          onClick={handleExportExcel}
          className="w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* Filters - with button approach */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="filter-search">Search</Label>
            <div className="relative mt-1">
              <Input
                id="filter-search"
                placeholder="Search by submission, patient, payer, or type..."
                value={tempFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="filter-status">Status</Label>
            <select
              id="filter-status"
              value={tempFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>
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
              <TableHead>Submission #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Payer</TableHead>
              <TableHead>Pending Type</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Duration (Days)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPendingRecords.length > 0 ? (
              filteredPendingRecords.map((record) => {
                const createdDate = new Date(record.createdAt);
                const currentDate = new Date();
                const durationInDays = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <TableRow 
                    key={record.id} 
                    className={durationInDays > 7 && record.isActive ? 'bg-red-50' : ''}
                  >
                    <TableCell className="font-medium">{record.submissionDetail.submission.submissionNumber}</TableCell>
                    <TableCell>{record.submissionDetail.submission.patient.patientName}</TableCell>
                    <TableCell>{record.submissionDetail.submission.payer.payerName}</TableCell>
                    <TableCell>{record.pendingType}</TableCell>
                    <TableCell>{createdDate.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`${durationInDays > 7 && record.isActive ? 'text-red-600 font-bold' : ''}`}>
                        {durationInDays}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${record.isActive ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {record.isActive ? 'Active' : 'Resolved'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {record.isActive && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleResolve(record.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  No pending records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{(paginatedPendingRecords.page - 1) * paginatedPendingRecords.limit + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(paginatedPendingRecords.page * paginatedPendingRecords.limit, paginatedPendingRecords.total)}
          </span>{' '}
          of <span className="font-medium">{paginatedPendingRecords.total}</span> results
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(paginatedPendingRecords.page - 1)}
            disabled={paginatedPendingRecords.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, paginatedPendingRecords.totalPages) }, (_, i) => {
              let pageNum;
              
              if (paginatedPendingRecords.totalPages <= 5) {
                // Show all pages if total is 5 or less
                pageNum = i + 1;
              } else if (paginatedPendingRecords.page <= 3) {
                // Show first 5 pages if current page is near the beginning
                pageNum = i + 1;
              } else if (paginatedPendingRecords.page >= paginatedPendingRecords.totalPages - 2) {
                // Show last 5 pages if current page is near the end
                pageNum = paginatedPendingRecords.totalPages - 4 + i;
              } else {
                // Show pages around the current page
                pageNum = paginatedPendingRecords.page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={paginatedPendingRecords.page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={
                    paginatedPendingRecords.page === pageNum 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : ""
                  }
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(paginatedPendingRecords.page + 1)}
            disabled={paginatedPendingRecords.page === paginatedPendingRecords.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {filteredPendingRecords.some(record => {
        const createdDate = new Date(record.createdAt);
        const currentDate = new Date();
        const durationInDays = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return durationInDays > 7 && record.isActive;
      }) && (
        <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> There are pending records older than 7 days that require attention.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}