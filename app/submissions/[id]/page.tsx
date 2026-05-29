'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

// Define schema for submission detail form validation
const submissionDetailSchema = z.object({
  submissionType: z.string().min(1, 'Submission Type is required'),
  submissionValue: z.number().min(0, 'Value must be positive'),
  note: z.string().optional(),
});

type SubmissionDetailFormValues = z.infer<typeof submissionDetailSchema>;

// Define schema for pending record form validation
const pendingRecordSchema = z.object({
  pendingType: z.string().min(1, 'Pending Type is required'),
  pendingNote: z.string().optional(),
});

type PendingRecordFormValues = z.infer<typeof pendingRecordSchema>;

// Mock data for demonstration
const mockSubmission = {
  id: '1',
  submissionNumber: 'SUB-001',
  patient: {
    patientName: 'John Doe',
    medicalRecordNumber: 'MR-001',
    gender: 'Male',
    birthDate: '1985-05-15'
  },
  room: {
    roomNumber: '101',
    bedNumber: 1,
    roomClass: 'VIP'
  },
  payer: {
    payerName: 'BPJS Kesehatan'
  },
  status: 'PENDING',
  submittedAt: '2023-05-01T10:00:00Z',
  approvedAt: null,
  rejectedAt: null,
  createdAt: '2023-05-01T09:00:00Z',
  updatedAt: '2023-05-01T11:00:00Z'
};

const mockDetails = [
  {
    id: '1',
    submissionType: 'ROOM',
    submissionValue: 1500000,
    note: 'VIP room charge for 3 days',
    pendingHistories: []
  },
  {
    id: '2',
    submissionType: 'MEDICINE',
    submissionValue: 250000,
    note: 'Prescription medications',
    pendingHistories: []
  },
  {
    id: '3',
    submissionType: 'LAB',
    submissionValue: 300000,
    note: 'Complete blood count test',
    pendingHistories: [
      {
        id: '1',
        pendingType: 'Authorization Required',
        pendingNote: 'Additional authorization needed for lab test',
        createdAt: '2023-05-01T10:30:00Z',
        resolvedAt: null,
        isActive: true
      }
    ]
  }
];

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<any>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isPendingDialogOpen, setIsPendingDialogOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<any>(null);
  const [selectedDetailForPending, setSelectedDetailForPending] = useState<any>(null);
  
  const { 
    register: registerDetail, 
    handleSubmit: handleSubmitDetail, 
    reset: resetDetail, 
    formState: { errors: detailErrors } 
  } = useForm<SubmissionDetailFormValues>({
    resolver: zodResolver(submissionDetailSchema),
  });

  const { 
    register: registerPending, 
    handleSubmit: handleSubmitPending, 
    reset: resetPending, 
    formState: { errors: pendingErrors } 
  } = useForm<PendingRecordFormValues>({
    resolver: zodResolver(pendingRecordSchema),
  });

  useEffect(() => {
    // In a real app, fetch submission data from API
    setTimeout(() => {
      setSubmission(mockSubmission);
      setDetails(mockDetails);
      setLoading(false);
    }, 500);
  }, [id]);

  const onSubmitDetail = (data: SubmissionDetailFormValues) => {
    if (editingDetail) {
      // Update existing detail
      setDetails(details.map(d => 
        d.id === editingDetail.id ? { ...d, ...data } : d
      ));
    } else {
      // Add new detail
      const newDetail = {
        id: (details.length + 1).toString(),
        ...data,
        pendingHistories: []
      };
      setDetails([...details, newDetail]);
    }
    
    resetDetail();
    setIsDetailDialogOpen(false);
    setEditingDetail(null);
  };

  const onSubmitPending = (data: PendingRecordFormValues) => {
    if (selectedDetailForPending) {
      // Add pending record to selected detail
      const updatedDetails = details.map(detail => {
        if (detail.id === selectedDetailForPending.id) {
          const newPending = {
            id: (detail.pendingHistories.length + 1).toString(),
            ...data,
            createdAt: new Date().toISOString(),
            resolvedAt: null,
            isActive: true
          };
          return {
            ...detail,
            pendingHistories: [...detail.pendingHistories, newPending]
          };
        }
        return detail;
      });
      
      setDetails(updatedDetails);
    }
    
    resetPending();
    setIsPendingDialogOpen(false);
    setSelectedDetailForPending(null);
  };

  const handleApprove = () => {
    // In a real app, call API to approve submission
    alert(`Submission ${submission.submissionNumber} approved!`);
  };

  const handleReject = () => {
    // In a real app, call API to reject submission
    alert(`Submission ${submission.submissionNumber} rejected!`);
  };

  const handleAddPending = (detail: any) => {
    setSelectedDetailForPending(detail);
    resetPending();
    setIsPendingDialogOpen(true);
  };

  const handleResolvePending = (detailId: string, pendingId: string) => {
    // In a real app, call API to resolve pending
    const updatedDetails = details.map(detail => {
      if (detail.id === detailId) {
        const updatedPendingHistories = detail.pendingHistories.map((pending: any) => 
          pending.id === pendingId ? { ...pending, resolvedAt: new Date().toISOString(), isActive: false } : pending
        );
        return { ...detail, pendingHistories: updatedPendingHistories };
      }
      return detail;
    });
    
    setDetails(updatedDetails);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submission Detail</h1>
          <p className="text-gray-600">ID: {submission.submissionNumber}</p>
        </div>
        <div className="flex space-x-3">
          <Badge 
            className={`${
              submission.status === 'APPROVED' ? 'bg-green-500' : 
              submission.status === 'PENDING' ? 'bg-yellow-500' : 
              submission.status === 'REJECTED' ? 'bg-red-500' : 
              submission.status === 'SUBMITTED' ? 'bg-blue-500' : 
              'bg-gray-500'
            }`}
          >
            {submission.status}
          </Badge>
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{submission.patient.patientName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Medical Record</p>
            <p className="font-medium">{submission.patient.medicalRecordNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-medium">{submission.patient.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Birth Date</p>
            <p className="font-medium">{new Date(submission.patient.birthDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Room and Payer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Room Information</h2>
          <div>
            <p className="text-sm text-gray-500">Room Number</p>
            <p className="font-medium">{submission.room.roomNumber}</p>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Bed Number</p>
            <p className="font-medium">{submission.room.bedNumber}</p>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Room Class</p>
            <p className="font-medium">{submission.room.roomClass}</p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Payer Information</h2>
          <div>
            <p className="text-sm text-gray-500">Payer Name</p>
            <p className="font-medium">{submission.payer.payerName}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <Button 
          variant="default" 
          className="bg-green-600 hover:bg-green-700"
          onClick={handleApprove}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve Submission
        </Button>
        <Button 
          variant="destructive"
          onClick={handleReject}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Reject Submission
        </Button>
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline"
              onClick={() => {
                setEditingDetail(null);
                resetDetail();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Detail
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingDetail ? 'Edit Detail' : 'Add New Detail'}</DialogTitle>
              <DialogDescription>
                {editingDetail 
                  ? 'Update submission detail information' 
                  : 'Enter submission detail information to add a new item'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitDetail(onSubmitDetail)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="submissionType" className="text-right">
                    Type
                  </Label>
                  <select
                    id="submissionType"
                    className="col-span-3 border rounded-md px-3 py-2"
                    {...registerDetail('submissionType')}
                  >
                    <option value="">Select Type</option>
                    <option value="ROOM">Room</option>
                    <option value="MEDICINE">Medicine</option>
                    <option value="LAB">Lab</option>
                    <option value="PROCEDURE">Procedure</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {detailErrors.submissionType && (
                    <p className="col-start-2 col-span-3 text-red-500 text-sm">
                      {detailErrors.submissionType.message}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="submissionValue" className="text-right">
                    Value
                  </Label>
                  <Input
                    id="submissionValue"
                    type="number"
                    className="col-span-3"
                    {...registerDetail('submissionValue', { valueAsNumber: true })}
                  />
                  {detailErrors.submissionValue && (
                    <p className="col-start-2 col-span-3 text-red-500 text-sm">
                      {detailErrors.submissionValue.message}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="note" className="text-right">
                    Note
                  </Label>
                  <textarea
                    id="note"
                    className="col-span-3 border rounded-md px-3 py-2"
                    rows={3}
                    {...registerDetail('note')}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingDetail ? 'Update Detail' : 'Add Detail'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Submission Details */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Pending Records</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((detail) => (
              <TableRow key={detail.id}>
                <TableCell className="font-medium">{detail.submissionType}</TableCell>
                <TableCell>Rp {detail.submissionValue.toLocaleString()}</TableCell>
                <TableCell>{detail.note}</TableCell>
                <TableCell>
                  {detail.pendingHistories.length > 0 ? (
                    <div className="space-y-1">
                      {detail.pendingHistories.map((pending: any) => (
                        <div 
                          key={pending.id} 
                          className={`flex justify-between items-center p-2 rounded ${
                            pending.isActive ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium">{pending.pendingType}</p>
                            <p className="text-xs text-gray-500">{pending.pendingNote}</p>
                            <p className="text-xs text-gray-400">
                              {dayjs(pending.createdAt).format('MMM DD, YYYY')} 
                              {pending.resolvedAt && ` - Resolved: ${dayjs(pending.resolvedAt).format('MMM DD, YYYY')}`}
                            </p>
                          </div>
                          {pending.isActive && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResolvePending(detail.id, pending.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">No pending records</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddPending(detail)}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Pending Dialog */}
      <Dialog open={isPendingDialogOpen} onOpenChange={setIsPendingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Pending Record</DialogTitle>
            <DialogDescription>
              Add a pending record for detail: {selectedDetailForPending?.submissionType}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPending(onSubmitPending)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pendingType" className="text-right">
                  Pending Type
                </Label>
                <Input
                  id="pendingType"
                  className="col-span-3"
                  {...registerPending('pendingType')}
                />
                {pendingErrors.pendingType && (
                  <p className="col-start-2 col-span-3 text-red-500 text-sm">
                    {pendingErrors.pendingType.message}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pendingNote" className="text-right">
                  Note
                </Label>
                <textarea
                  id="pendingNote"
                  className="col-span-3 border rounded-md px-3 py-2"
                  rows={3}
                  {...registerPending('pendingNote')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                Add Pending Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}