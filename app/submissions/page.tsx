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
import { Plus, Eye, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema for submission form validation
const submissionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  roomId: z.string().min(1, 'Room is required'),
  payerId: z.string().min(1, 'Payer is required'),
});

type SubmissionFormValues = z.infer<typeof submissionSchema>;

// Mock data for demonstration
const mockPatients = [
  { id: '1', medicalRecordNumber: 'MR-001', patientName: 'John Doe' },
  { id: '2', medicalRecordNumber: 'MR-002', patientName: 'Jane Smith' },
];

const mockRooms = [
  { id: '1', roomNumber: '101', roomClass: 'VIP' },
  { id: '2', roomNumber: '102', roomClass: 'Regular' },
];

const mockPayers = [
  { id: '1', payerName: 'BPJS Kesehatan' },
  { id: '2', payerName: 'Asuransi Swasta A' },
];

const mockSubmissions = [
  { id: '1', submissionNumber: 'SUB-001', patientName: 'John Doe', payer: 'BPJS Kesehatan', status: 'APPROVED', totalDetails: 3, totalPending: 0, createdAt: '2023-05-01' },
  { id: '2', submissionNumber: 'SUB-002', patientName: 'Jane Smith', payer: 'Asuransi Swasta A', status: 'PENDING', totalDetails: 2, totalPending: 1, createdAt: '2023-05-02' },
  { id: '3', submissionNumber: 'SUB-003', patientName: 'Robert Johnson', payer: 'BPJS Kesehatan', status: 'SUBMITTED', totalDetails: 4, totalPending: 0, createdAt: '2023-05-03' },
];

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
  });

  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = filterStatus === 'all' || sub.status.toLowerCase() === filterStatus;
    const matchesSearch = sub.submissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sub.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const onSubmit = (data: SubmissionFormValues) => {
    // For demo purposes, we'll just close the dialog
    reset();
    setIsDialogOpen(false);
    setEditingSubmission(null);
  };

  const handleView = (submission: any) => {
    // Navigate to submission detail page
    console.log('View submission:', submission);
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center border rounded-md px-3">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search submissions..."
              className="ml-2 py-2 bg-transparent outline-none w-full sm:w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="border rounded-md px-3 py-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingSubmission(null);
                    reset();
                  }}
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
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="patientId" className="text-right">
                        Patient
                      </Label>
                      <select
                        id="patientId"
                        className="col-span-3 border rounded-md px-3 py-2"
                        {...register('patientId')}
                      >
                        <option value="">Select Patient</option>
                        {mockPatients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.patientName} ({patient.medicalRecordNumber})
                          </option>
                        ))}
                      </select>
                      {errors.patientId && (
                        <p className="col-start-2 col-span-3 text-red-500 text-sm">
                          {errors.patientId.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="roomId" className="text-right">
                        Room
                      </Label>
                      <select
                        id="roomId"
                        className="col-span-3 border rounded-md px-3 py-2"
                        {...register('roomId')}
                      >
                        <option value="">Select Room</option>
                        {mockRooms.map(room => (
                          <option key={room.id} value={room.id}>
                            {room.roomNumber} ({room.roomClass})
                          </option>
                        ))}
                      </select>
                      {errors.roomId && (
                        <p className="col-start-2 col-span-3 text-red-500 text-sm">
                          {errors.roomId.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="payerId" className="text-right">
                        Payer
                      </Label>
                      <select
                        id="payerId"
                        className="col-span-3 border rounded-md px-3 py-2"
                        {...register('payerId')}
                      >
                        <option value="">Select Payer</option>
                        {mockPayers.map(payer => (
                          <option key={payer.id} value={payer.id}>
                            {payer.payerName}
                          </option>
                        ))}
                      </select>
                      {errors.payerId && (
                        <p className="col-start-2 col-span-3 text-red-500 text-sm">
                          {errors.payerId.message}
                        </p>
                      )}
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
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
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
            {filteredSubmissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">{submission.submissionNumber}</TableCell>
                <TableCell>{submission.patientName}</TableCell>
                <TableCell>{submission.payer}</TableCell>
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
                <TableCell>{submission.totalDetails}</TableCell>
                <TableCell>{submission.totalPending}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}