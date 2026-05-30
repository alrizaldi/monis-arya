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
import { Plus, Eye, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Types for the dropdown data
type Patient = {
  id: string;
  medicalRecordNumber: string;
  patientName: string;
};

type Room = {
  id: string;
  roomNumber: string;
  roomClass: string;
};

type Payer = {
  id: string;
  payerName: string;
};

// Define Submission type based on the actual API response
type Submission = {
  id: string;
  submissionNumber: string;
  patient: {
    id: string;
    patientName: string;
    medicalRecordNumber: string;
    gender: string;
    birthDate: Date;
    createdAt: Date;
    updatedAt: Date;
  };
  room: {
    id: string;
    roomNumber: string;
    bedNumber: number;
    roomClass: string;
    createdAt: Date;
    updatedAt: Date;
  };
  payer: {
    id: string;
    payerName: string;
    createdAt: Date;
    updatedAt: Date;
  };
  status: string;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  details: Array<{
    id: string;
    submissionType: string;
    submissionValue: number;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
    pendingHistories: Array<{
      id: string;
      pendingType: string;
      pendingNote?: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>
  }>;
};

// Searchable Select Component
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  id,
}: {
  options: Array<{ id: string; name: string; additionalInfo?: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  id: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.additionalInfo && option.additionalInfo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedOption = options.find(option => option.id === value);

  return (
    <div className="relative">
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">
        <button
          type="button"
          className="w-full border rounded-md px-3 py-2 text-left flex justify-between items-center border-gray-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? `${selectedOption.name}${selectedOption.additionalInfo ? ` (${selectedOption.additionalInfo})` : ''}` : placeholder}
          </span>
          <span>{isOpen ? '▲' : '▼'}</span>
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="p-2 border-b">
              <Input
                type="text"
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      value === option.id ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    <div className="font-medium">{option.name}</div>
                    {option.additionalInfo && (
                      <div className="text-sm text-gray-500">{option.additionalInfo}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500">No options found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function SubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  
  // Dropdown data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payers, setPayers] = useState<Payer[]>([]);
  
  // Form values
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedPayerId, setSelectedPayerId] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    submissionNumber: '',
    patientName: '',
    payerName: '',
    status: ''
  });
  
  // Temporary filter values for input fields
  const [tempFilters, setTempFilters] = useState({
    submissionNumber: '',
    patientName: '',
    payerName: '',
    status: ''
  });

  // Load submissions from API with pagination and filters
  useEffect(() => {
    const loadSubmissions = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        
        if (filters.submissionNumber) {
          queryParams.append('submissionNumber', filters.submissionNumber);
        }
        if (filters.patientName) {
          queryParams.append('patientName', filters.patientName);
        }
        if (filters.payerName) {
          queryParams.append('payerName', filters.payerName);
        }
        if (filters.status) {
          queryParams.append('status', filters.status);
        }

        const response = await fetch(`/api/submissions?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }
        const result = await response.json();
        
        setSubmissions(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit
        });
      } catch (error) {
        console.error("Error loading submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [pagination.page, filters]);

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        // Load patients
        const patientsResponse = await fetch('/api/patients');
        if (patientsResponse.ok) {
          const patientsResult = await patientsResponse.json();
          setPatients(Array.isArray(patientsResult) ? patientsResult : patientsResult.data || []);
        }
        
        // Load rooms
        const roomsResponse = await fetch('/api/rooms');
        if (roomsResponse.ok) {
          const roomsResult = await roomsResponse.json();
          setRooms(Array.isArray(roomsResult) ? roomsResult : roomsResult.data || []);
        }
        
        // Load payers
        const payersResponse = await fetch('/api/payers');
        if (payersResponse.ok) {
          const payersResult = await payersResponse.json();
          setPayers(Array.isArray(payersResult) ? payersResult : payersResult.data || []);
        }
      } catch (error) {
        console.error("Error loading dropdown data:", error);
      }
    };

    loadDropdownData();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!selectedPatientId || !selectedRoomId || !selectedPayerId) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      console.log("Saving submission:", { selectedPatientId, selectedRoomId, selectedPayerId });
      let response;
      
      if (editingSubmission) {
        // Update existing submission
        response = await fetch(`/api/submissions/${editingSubmission.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patientId: selectedPatientId,
            roomId: selectedRoomId,
            payerId: selectedPayerId
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update submission');
        }
        
        // Refresh the submission list after update
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        
        if (filters.submissionNumber) {
          queryParams.append('submissionNumber', filters.submissionNumber);
        }
        if (filters.patientName) {
          queryParams.append('patientName', filters.patientName);
        }
        if (filters.payerName) {
          queryParams.append('payerName', filters.payerName);
        }
        if (filters.status) {
          queryParams.append('status', filters.status);
        }

        const refreshResponse = await fetch(`/api/submissions?${queryParams}`);
        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh submissions');
        }
        const result = await refreshResponse.json();
        
        setSubmissions(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit
        });
      } else {
        // Add new submission
        response = await fetch('/api/submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            submissionNumber: `SUB-${Date.now()}`, // Generate a unique number for demo
            patientId: selectedPatientId,
            roomId: selectedRoomId,
            payerId: selectedPayerId
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create submission');
        }
        
        // Refresh the submission list after adding
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        
        if (filters.submissionNumber) {
          queryParams.append('submissionNumber', filters.submissionNumber);
        }
        if (filters.patientName) {
          queryParams.append('patientName', filters.patientName);
        }
        if (filters.payerName) {
          queryParams.append('payerName', filters.payerName);
        }
        if (filters.status) {
          queryParams.append('status', filters.status);
        }

        const refreshResponse = await fetch(`/api/submissions?${queryParams}`);
        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh submissions');
        }
        const result = await refreshResponse.json();
        
        setSubmissions(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit
        });
      }

      setIsDialogOpen(false);
      setEditingSubmission(null);
      // Reset selection values
      setSelectedPatientId('');
      setSelectedRoomId('');
      setSelectedPayerId('');
    } catch (error) {
      console.error("Error saving submission:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the submission",
      );
    }
  };

  const handleView = (submission: Submission) => {
    // Navigate to submission detail page
    router.push(`/submissions/${submission.id}`);
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
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleClearFilters = () => {
    // Clear all filters
    setTempFilters({
      submissionNumber: '',
      patientName: '',
      payerName: '',
      status: ''
    });
    setFilters({
      submissionNumber: '',
      patientName: '',
      payerName: '',
      status: ''
    });
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
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingSubmission(null);
                  // Reset selection values
                  setSelectedPatientId('');
                  setSelectedRoomId('');
                  setSelectedPayerId('');
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Submission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Submission</DialogTitle>
                <DialogDescription>
                  Enter submission information to create a new insurance submission
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-span-4">
                      <SearchableSelect
                        id="patientId"
                        label="Patient"
                        options={patients.map(p => ({
                          id: p.id,
                          name: p.patientName,
                          additionalInfo: p.medicalRecordNumber
                        }))}
                        value={selectedPatientId}
                        onChange={setSelectedPatientId}
                        placeholder="Select Patient"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-span-4">
                      <SearchableSelect
                        id="roomId"
                        label="Room"
                        options={rooms.map(r => ({
                          id: r.id,
                          name: r.roomNumber,
                          additionalInfo: r.roomClass
                        }))}
                        value={selectedRoomId}
                        onChange={setSelectedRoomId}
                        placeholder="Select Room"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-span-4">
                      <SearchableSelect
                        id="payerId"
                        label="Payer"
                        options={payers.map(p => ({
                          id: p.id,
                          name: p.payerName
                        }))}
                        value={selectedPayerId}
                        onChange={setSelectedPayerId}
                        placeholder="Select Payer"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    Create Submission
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters - with button approach */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="filter-submission-number">Submission #</Label>
            <div className="relative mt-1">
              <Input
                id="filter-submission-number"
                placeholder="Filter by Submission #"
                value={tempFilters.submissionNumber}
                onChange={(e) => handleFilterChange('submissionNumber', e.target.value)}
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="filter-patient-name">Patient Name</Label>
            <div className="relative mt-1">
              <Input
                id="filter-patient-name"
                placeholder="Filter by Patient Name"
                value={tempFilters.patientName}
                onChange={(e) => handleFilterChange('patientName', e.target.value)}
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="filter-payer-name">Payer</Label>
            <div className="relative mt-1">
              <Input
                id="filter-payer-name"
                placeholder="Filter by Payer"
                value={tempFilters.payerName}
                onChange={(e) => handleFilterChange('payerName', e.target.value)}
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
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
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

      {/* Scrollable table container */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Submission #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Payer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Details</TableHead>
              <TableHead>Total Pending</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => {
              // Calculate total details and pending records
              const totalDetails = submission.details.length;
              const totalPending = submission.details.reduce((count, detail) => {
                return count + detail.pendingHistories.filter(ph => ph.isActive).length;
              }, 0);
              
              return (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.submissionNumber}</TableCell>
                  <TableCell>{submission.patient?.patientName || 'N/A'}</TableCell>
                  <TableCell>{submission.payer?.payerName || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${submission.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                        submission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        submission.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                        submission.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {submission.status}
                    </span>
                  </TableCell>
                  <TableCell>{totalDetails}</TableCell>
                  <TableCell>{totalPending}</TableCell>
                  <TableCell>{new Date(submission.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleView(submission)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {submissions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  No submissions found
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