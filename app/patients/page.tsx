"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define schema for patient form validation
const patientSchema = z.object({
  medicalRecordNumber: z.string().min(1, "Medical Record Number is required"),
  patientName: z.string().min(1, "Patient Name is required"),
  gender: z.string().min(1, "Gender is required"),
  birthDate: z.string().min(1, "Birth Date is required"),
});

type PatientFormValues = z.infer<typeof patientSchema>;

// Define Patient type
type Patient = {
  id: string;
  medicalRecordNumber: string;
  patientName: string;
  gender: string;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    medicalRecordNumber: '',
    patientName: '',
    gender: '',
    birthDate: ''
  });
  
  // Temporary filter values for input fields
  const [tempFilters, setTempFilters] = useState({
    medicalRecordNumber: '',
    patientName: '',
    gender: '',
    birthDate: ''
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
  });

  // Load patients from API with pagination and filters
  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        
        if (filters.medicalRecordNumber) {
          queryParams.append('medicalRecordNumber', filters.medicalRecordNumber);
        }
        if (filters.patientName) {
          queryParams.append('patientName', filters.patientName);
        }
        if (filters.gender) {
          queryParams.append('gender', filters.gender);
        }
        if (filters.birthDate) {
          queryParams.append('birthDate', filters.birthDate);
        }

        const response = await fetch(`/api/patients?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        const result: PaginatedResult<Patient> = await response.json();
        
        setPatients(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit
        });
      } catch (error) {
        console.error("Error loading patients:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [pagination.page, filters]);

  const onSubmit = async (data: PatientFormValues) => {
    try {
      console.log("Saving patient:", data);
      let response;
      
      if (editingPatient) {
        // Update existing patient
        response = await fetch(`/api/patients/${editingPatient.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            medicalRecordNumber: data.medicalRecordNumber,
            patientName: data.patientName,
            gender: data.gender,
            birthDate: new Date(data.birthDate),
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update patient');
        }
        
        // Refresh the patient list after update
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        
        if (filters.medicalRecordNumber) {
          queryParams.append('medicalRecordNumber', filters.medicalRecordNumber);
        }
        if (filters.patientName) {
          queryParams.append('patientName', filters.patientName);
        }
        if (filters.gender) {
          queryParams.append('gender', filters.gender);
        }
        if (filters.birthDate) {
          queryParams.append('birthDate', filters.birthDate);
        }

        const refreshResponse = await fetch(`/api/patients?${queryParams}`);
        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh patients');
        }
        const result: PaginatedResult<Patient> = await refreshResponse.json();
        
        setPatients(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit
        });
      } else {
        // Add new patient
        response = await fetch('/api/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            medicalRecordNumber: data.medicalRecordNumber,
            patientName: data.patientName,
            gender: data.gender,
            birthDate: new Date(data.birthDate),
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create patient');
        }
        
        // Refresh the patient list after adding
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        
        if (filters.medicalRecordNumber) {
          queryParams.append('medicalRecordNumber', filters.medicalRecordNumber);
        }
        if (filters.patientName) {
          queryParams.append('patientName', filters.patientName);
        }
        if (filters.gender) {
          queryParams.append('gender', filters.gender);
        }
        if (filters.birthDate) {
          queryParams.append('birthDate', filters.birthDate);
        }

        const refreshResponse = await fetch(`/api/patients?${queryParams}`);
        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh patients');
        }
        const result: PaginatedResult<Patient> = await refreshResponse.json();
        
        setPatients(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit
        });
      }

      reset();
      setIsDialogOpen(false);
      setEditingPatient(null);
    } catch (error) {
      console.error("Error saving patient:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the patient",
      );
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setValue("medicalRecordNumber", patient.medicalRecordNumber);
    setValue("patientName", patient.patientName);
    setValue("gender", patient.gender);
    setValue(
      "birthDate",
      new Date(patient.birthDate).toISOString().split("T")[0],
    ); // Format date as YYYY-MM-DD
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        const response = await fetch(`/api/patients/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete patient');
        }
        
        // Refresh the patient list after deletion
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });
        
        if (filters.medicalRecordNumber) {
          queryParams.append('medicalRecordNumber', filters.medicalRecordNumber);
        }
        if (filters.patientName) {
          queryParams.append('patientName', filters.patientName);
        }
        if (filters.gender) {
          queryParams.append('gender', filters.gender);
        }
        if (filters.birthDate) {
          queryParams.append('birthDate', filters.birthDate);
        }

        const refreshResponse = await fetch(`/api/patients?${queryParams}`);
        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh patients');
        }
        const result: PaginatedResult<Patient> = await refreshResponse.json();
        
        setPatients(result.data);
        setPagination({
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: result.limit
        });
      } catch (error) {
        console.error("Error deleting patient:", error);
        alert("An error occurred while deleting the patient");
      }
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
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleClearFilters = () => {
    // Clear all filters
    setTempFilters({
      medicalRecordNumber: '',
      patientName: '',
      gender: '',
      birthDate: ''
    });
    setFilters({
      medicalRecordNumber: '',
      patientName: '',
      gender: '',
      birthDate: ''
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
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingPatient(null);
                  reset();
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPatient ? "Edit Patient" : "Add New Patient"}
                </DialogTitle>
                <DialogDescription>
                  {editingPatient
                    ? "Update patient information"
                    : "Enter patient information to add a new patient"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="medicalRecordNumber" className="text-right">
                      MR Number
                    </Label>
                    <Input
                      id="medicalRecordNumber"
                      className="col-span-3"
                      {...register("medicalRecordNumber")}
                    />
                    {errors.medicalRecordNumber && (
                      <p className="col-start-2 col-span-3 text-red-500 text-sm">
                        {errors.medicalRecordNumber.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="patientName" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="patientName"
                      className="col-span-3"
                      {...register("patientName")}
                    />
                    {errors.patientName && (
                      <p className="col-start-2 col-span-3 text-red-500 text-sm">
                        {errors.patientName.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gender" className="text-right">
                      Gender
                    </Label>
                    <select
                      id="gender"
                      className="col-span-3 border rounded-md px-3 py-2"
                      {...register("gender")}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    {errors.gender && (
                      <p className="col-start-2 col-span-3 text-red-500 text-sm">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="birthDate" className="text-right">
                      Birth Date
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      className="col-span-3"
                      {...register("birthDate")}
                    />
                    {errors.birthDate && (
                      <p className="col-start-2 col-span-3 text-red-500 text-sm">
                        {errors.birthDate.message}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingPatient ? "Update Patient" : "Add Patient"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters - completely isolated from form context */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="filter-medical-record">MR Number</Label>
            <div className="relative mt-1">
              <Input
                id="filter-medical-record"
                placeholder="Filter by MR Number"
                value={tempFilters.medicalRecordNumber}
                onChange={(e) => handleFilterChange('medicalRecordNumber', e.target.value)}
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
                placeholder="Filter by Name"
                value={tempFilters.patientName}
                onChange={(e) => handleFilterChange('patientName', e.target.value)}
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="filter-gender">Gender</Label>
            <select
              id="filter-gender"
              value={tempFilters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="filter-birth-date">Birth Date</Label>
            <Input
              id="filter-birth-date"
              type="date"
              value={tempFilters.birthDate}
              onChange={(e) => handleFilterChange('birthDate', e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>MR Number</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Birth Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">
                  {patient.medicalRecordNumber}
                </TableCell>
                <TableCell>{patient.patientName}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>
                  {new Date(patient.birthDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(patient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(patient.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {patients.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  No patients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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