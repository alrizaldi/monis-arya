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
import { Plus, Edit, Trash2, Search, Filter, Clock, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

// Define schema for pending form validation
const pendingSchema = z.object({
  submissionNumber: z.string().min(1, 'Submission Number is required'),
  patient: z.string().min(1, 'Patient is required'),
  pendingType: z.string().min(1, 'Pending Type is required'),
});

type PendingFormValues = z.infer<typeof pendingSchema>;

// Mock data for demonstration
const mockPayers = [
  { id: '1', payerName: 'BPJS Kesehatan' },
  { id: '2', payerName: 'Asuransi Swasta A' },
];

const mockPendingRecords = [
  { id: '1', submissionNumber: 'SUB-001', patient: 'John Doe', payer: 'BPJS Kesehatan', pendingType: 'Medication Approval', pendingDate: '2023-05-01', duration: 5, status: 'active' },
  { id: '2', submissionNumber: 'SUB-002', patient: 'Jane Smith', payer: 'Asuransi Swasta A', pendingType: 'Lab Test', pendingDate: '2023-05-02', duration: 3, status: 'active' },
  { id: '3', submissionNumber: 'SUB-003', patient: 'Robert Johnson', payer: 'BPJS Kesehatan', pendingType: 'Procedure', pendingDate: '2023-04-28', duration: 8, status: 'resolved' },
  { id: '4', submissionNumber: 'SUB-004', patient: 'Emily Davis', payer: 'BPJS Kesehatan', pendingType: 'Room Upgrade', pendingDate: '2023-05-03', duration: 2, status: 'active' },
];

export default function PendingPage() {
  const [pendingRecords, setPendingRecords] = useState(mockPendingRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPending, setEditingPending] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayer, setFilterPayer] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PendingFormValues>({
    resolver: zodResolver(pendingSchema),
  });

  const filteredPendingRecords = pendingRecords.filter(record => {
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesPayer = filterPayer === 'all' || record.payer === filterPayer;
    const matchesSearch = record.submissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          record.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.pendingType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPayer && matchesSearch;
  });

  const onSubmit = (data: PendingFormValues) => {
    // For demo purposes, we'll just close the dialog
    reset();
    setIsDialogOpen(false);
    setEditingPending(null);
  };

  const handleResolve = (id: string) => {
    // Mark pending as resolved
    setPendingRecords(pendingRecords.map(record => 
      record.id === id ? { ...record, status: 'resolved' } : record
    ));
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Pending Monitoring</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center border rounded-md px-3">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search pending records..."
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
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>
            
            <select
              className="border rounded-md px-3 py-2"
              value={filterPayer}
              onChange={(e) => setFilterPayer(e.target.value)}
            >
              <option value="all">All Payers</option>
              {mockPayers.map(payer => (
                <option key={payer.id} value={payer.payerName}>
                  {payer.payerName}
                </option>
              ))}
            </select>
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
              <TableHead>Pending Type</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Duration (Days)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPendingRecords.map((record) => (
              <TableRow 
                key={record.id} 
                className={record.duration > 7 && record.status === 'active' ? 'bg-red-50' : ''}
              >
                <TableCell className="font-medium">{record.submissionNumber}</TableCell>
                <TableCell>{record.patient}</TableCell>
                <TableCell>{record.payer}</TableCell>
                <TableCell>{record.pendingType}</TableCell>
                <TableCell>{new Date(record.pendingDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={`${record.duration > 7 && record.status === 'active' ? 'text-red-600 font-bold' : ''}`}>
                    {record.duration}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${record.status === 'active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {record.status === 'active' && (
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
            ))}
          </TableBody>
        </Table>
      </div>
      
      {filteredPendingRecords.some(record => record.duration > 7 && record.status === 'active') && (
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