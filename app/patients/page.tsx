"use client";

import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2 } from "lucide-react";
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

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
  });

  // Load patients from API
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await fetch('/api/patients');
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        const data = await response.json();
        setPatients(data);
      } catch (error) {
        console.error("Error loading patients:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

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
        
        const updatedPatient = await response.json();
        setPatients(
          patients.map((p) =>
            p.id === editingPatient.id ? updatedPatient : p,
          ),
        );
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
        
        const newPatient = await response.json();
        setPatients([...patients, newPatient]);
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
        
        setPatients(patients.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting patient:", error);
        alert("An error occurred while deleting the patient");
      }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPatient(null);
                reset();
              }}
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
    </div>
  );
}