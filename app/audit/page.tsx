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
import { Search, Filter } from 'lucide-react';
import dayjs from 'dayjs';

// Mock data for demonstration
const mockAuditLogs = [
  { id: '1', moduleName: 'Submissions', actionType: 'CREATE_SUBMISSION', referenceId: 'SUB-001', description: 'Created new submission for patient John Doe', createdBy: 'admin', createdAt: '2023-05-01T10:30:00Z' },
  { id: '2', moduleName: 'Submissions', actionType: 'ADD_PENDING', referenceId: 'SUB-001', description: 'Added pending record for medication approval', createdBy: 'admin', createdAt: '2023-05-01T11:15:00Z' },
  { id: '3', moduleName: 'Submissions', actionType: 'APPROVE_SUBMISSION', referenceId: 'SUB-001', description: 'Approved submission SUB-001', createdBy: 'admin', createdAt: '2023-05-01T14:20:00Z' },
  { id: '4', moduleName: 'Submissions', actionType: 'CREATE_SUBMISSION', referenceId: 'SUB-002', description: 'Created new submission for patient Jane Smith', createdBy: 'admin', createdAt: '2023-05-02T09:45:00Z' },
  { id: '5', moduleName: 'Pending', actionType: 'RESOLVE_PENDING', referenceId: 'SUB-002', description: 'Resolved pending issue for lab test', createdBy: 'admin', createdAt: '2023-05-02T12:30:00Z' },
  { id: '6', moduleName: 'Submissions', actionType: 'REJECT_SUBMISSION', referenceId: 'SUB-003', description: 'Rejected submission SUB-003 due to missing documents', createdBy: 'admin', createdAt: '2023-05-03T16:45:00Z' },
];

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);
  const [filterModule, setFilterModule] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Get unique modules and actions for filters
  const uniqueModules = Array.from(new Set(mockAuditLogs.map(log => log.moduleName)));
  const uniqueActions = Array.from(new Set(mockAuditLogs.map(log => log.actionType)));
  
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesModule = filterModule === 'all' || log.moduleName === filterModule;
    const matchesAction = filterAction === 'all' || log.actionType === filterAction;
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(log.createdAt) >= new Date(startDate);
    }
    if (endDate) {
      matchesDate = matchesDate && new Date(log.createdAt) <= new Date(endDate);
    }
    
    return matchesModule && matchesAction && matchesSearch && matchesDate;
  });

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center border rounded-md px-3">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search logs..."
              className="ml-2 py-2 bg-transparent outline-none w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="border rounded-md px-3 py-2"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            <option value="all">All Modules</option>
            {uniqueModules.map(module => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
          
          <select
            className="border rounded-md px-3 py-2"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <input
              type="date"
              className="border rounded-md px-3 py-2 w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="border rounded-md px-3 py-2 w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
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
            {filteredAuditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.moduleName}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {log.actionType}
                  </span>
                </TableCell>
                <TableCell>{log.referenceId}</TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell>{log.createdBy}</TableCell>
                <TableCell>{dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}