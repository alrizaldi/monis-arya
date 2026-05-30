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
  submissionValue: z.string().min(1, 'Value is required'), // Changed from number to string
  note: z.string().optional(),
});

type SubmissionDetailFormValues = z.infer<typeof submissionDetailSchema>;

// Define schema for pending record form validation
const pendingRecordSchema = z.object({
  pendingType: z.string().min(1, 'Pending Type is required'),
  pendingNote: z.string().optional(),
});

type PendingRecordFormValues = z.infer<typeof pendingRecordSchema>;

// Define types based on the actual API response
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
    submissionValue: string; // Changed from number to string
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
      resolvedAt?: Date;
    }>
  }>;
};

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [details, setDetails] = useState<Submission['details']>([]);
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
    // Fetch submission data from API
    const fetchSubmission = async () => {
      try {
        const response = await fetch(`/api/submissions/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch submission');
        }
        const data = await response.json();
        setSubmission(data);
        setDetails(data.details || []);
      } catch (error) {
        console.error("Error fetching submission:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const onSubmitDetail = async (data: SubmissionDetailFormValues) => {
    try {
      if (editingDetail) {
        // Update existing detail
        const response = await fetch(`/api/submissions/${id}/details/${editingDetail.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            submissionValue: data.submissionValue // Now sending as string
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update detail');
        }
      } else {
        // Add new detail
        const response = await fetch(`/api/submissions/${id}/details`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            submissionValue: data.submissionValue // Now sending as string
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create detail');
        }
      }
      
      // Refresh the submission data
      const refreshResponse = await fetch(`/api/submissions/${id}`);
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh submission');
      }
      const data = await refreshResponse.json();
      setSubmission(data);
      setDetails(data.details || []);
      
      resetDetail();
      setIsDetailDialogOpen(false);
      setEditingDetail(null);
    } catch (error) {
      console.error("Error saving detail:", error);
      alert(error instanceof Error ? error.message : "An error occurred while saving the detail");
    }
  };

  const onSubmitPending = async (data: PendingRecordFormValues) => {
    try {
      if (selectedDetailForPending) {
        // Add pending record to selected detail
        const response = await fetch(`/api/submissions/${id}/details/${selectedDetailForPending.id}/pending`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create pending record');
        }
        
        // Refresh the submission data
        const refreshResponse = await fetch(`/api/submissions/${id}`);
        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh submission');
        }
        const refreshedData = await refreshResponse.json();
        setSubmission(refreshedData);
        setDetails(refreshedData.details || []);
      }
      
      resetPending();
      setIsPendingDialogOpen(false);
      setSelectedDetailForPending(null);
    } catch (error) {
      console.error("Error adding pending record:", error);
      alert(error instanceof Error ? error.message : "An error occurred while adding the pending record");
    }
  };

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          },
        body: JSON.stringify({
          action: 'approve'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve submission');
      }
      
      // Refresh the submission data
      const refreshResponse = await fetch(`/api/submissions/${id}`);
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh submission');
      }
      const data = await refreshResponse.json();
      setSubmission(data);
      setDetails(data.details || []);
      
      alert(`Submission ${submission?.submissionNumber} approved!`);
    } catch (error) {
      console.error("Error approving submission:", error);
      alert(error instanceof Error ? error.message : "An error occurred while approving the submission");
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject submission');
      }
      
      // Refresh the submission data
      const refreshResponse = await fetch(`/api/submissions/${id}`);
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh submission');
      }
      const data = await refreshResponse.json();
      setSubmission(data);
      setDetails(data.details || []);
      
      alert(`Submission ${submission?.submissionNumber} rejected!`);
    } catch (error) {
      console.error("Error rejecting submission:", error);
      alert(error instanceof Error ? error.message : "An error occurred while rejecting the submission");
    }
  };

  const handleAddPending = (detail: any) => {
    setSelectedDetailForPending(detail);
    resetPending();
    setIsPendingDialogOpen(true);
  };

  const handleResolvePending = async (detailId: string, pendingId: string) => {
    try {
      const response = await fetch(`/api/submissions/${id}/details/${detailId}/pending/${pendingId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'resolve'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resolve pending record');
      }
      
      // Refresh the submission data
      const refreshResponse = await fetch(`/api/submissions/${id}`);
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh submission');
      }
      const data = await refreshResponse.json();
      setSubmission(data);
      setDetails(data.details || []);
    } catch (error) {
      console.error("Error resolving pending record:", error);
      alert(error instanceof Error ? error.message : "An error occurred while resolving the pending record");
    }
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
          <p className="text-gray-600">ID: {submission?.submissionNumber}</p>
        </div>
        <div className="flex space-x-3">
          <Badge 
            className={`${
              submission?.status === 'APPROVED' ? 'bg-green-500' : 
              submission?.status === 'PENDING' ? 'bg-yellow-500' : 
              submission?.status === 'REJECTED' ? 'bg-red-500' : 
              submission?.status === 'SUBMITTED' ? 'bg-blue-500' : 
              'bg-gray-500'
            }`}
          >
            {submission?.status}
          </Badge>
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{submission?.patient.patientName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Medical Record</p>
            <p className="font-medium">{submission?.patient.medicalRecordNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-medium">{submission?.patient.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Birth Date</p>
            <p className="font-medium">{submission?.patient.birthDate ? new Date(submission.patient.birthDate).toLocaleDateString() : ''}</p>
          </div>
        </div>
      </div>

      {/* Room and Payer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Room Information</h2>
          <div>
            <p className="text-sm text-gray-500">Room Number</p>
            <p className="font-medium">{submission?.room.roomNumber}</p>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Bed Number</p>
            <p className="font-medium">{submission?.room.bedNumber}</p>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Room Class</p>
            <p className="font-medium">{submission?.room.roomClass}</p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Payer Information</h2>
          <div>
            <p className="text-sm text-gray-500">Payer Name</p>
            <p className="font-medium">{submission?.payer.payerName}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <Button 
          variant="default" 
          className="bg-green-600 hover:bg-green-700"
          onClick={handleApprove}
          disabled={submission?.status === 'APPROVED' || submission?.status === 'REJECTED'}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve Submission
        </Button>
        <Button 
          variant="destructive"
          onClick={handleReject}
          disabled={submission?.status === 'APPROVED' || submission?.status === 'REJECTED'}
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
                    type="text"
                    className="col-span-3"
                    {...registerDetail('submissionValue')}
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
                <TableCell>{detail.submissionValue}</TableCell>
                <TableCell>{detail.note}</TableCell>
                <TableCell>
                  {detail.pendingHistories.length > 0 ? (
                    <div className="space-y-1">
                      {detail.pendingHistories.map((pending) => (
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