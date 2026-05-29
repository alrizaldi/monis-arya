'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  TrendingUp,
  DollarSign
} from 'lucide-react';

// Mock data for demonstration
const mockDashboardData = {
  totalSubmissions: 124,
  pendingSubmissions: 32,
  approvedSubmissions: 78,
  rejectedSubmissions: 14,
  activePendingCount: 45
};

const statusData = [
  { name: 'Draft', value: 10 },
  { name: 'Submitted', value: 15 },
  { name: 'Pending', value: 32 },
  { name: 'Approved', value: 78 },
  { name: 'Rejected', value: 14 }
];

const pendingTrendData = [
  { date: 'May 1', pending: 12 },
  { date: 'May 2', pending: 19 },
  { date: 'May 3', pending: 8 },
  { date: 'May 4', pending: 24 },
  { date: 'May 5', pending: 15 },
  { date: 'May 6', pending: 30 },
  { date: 'May 7', pending: 22 }
];

const payerStatsData = [
  { name: 'BPJS', value: 45 },
  { name: 'Asuransi Swasta A', value: 30 },
  { name: 'Asuransi Swasta B', value: 25 },
  { name: 'Asuransi Swasta C', value: 20 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const monthlyTrendData = [
  { month: 'Jan', submissions: 85 },
  { month: 'Feb', submissions: 72 },
  { month: 'Mar', submissions: 98 },
  { month: 'Apr', submissions: 112 },
  { month: 'May', submissions: 124 }
];

const recentSubmissions = [
  { id: 1, submissionNumber: 'SUB-001', patientName: 'John Doe', payer: 'BPJS', status: 'APPROVED', date: '2023-05-01' },
  { id: 2, submissionNumber: 'SUB-002', patientName: 'Jane Smith', payer: 'Asuransi Swasta A', status: 'PENDING', date: '2023-05-02' },
  { id: 3, submissionNumber: 'SUB-003', patientName: 'Robert Johnson', payer: 'BPJS', status: 'REJECTED', date: '2023-05-03' },
  { id: 4, submissionNumber: 'SUB-004', patientName: 'Emily Davis', payer: 'Asuransi Swasta B', status: 'APPROVED', date: '2023-05-04' },
  { id: 5, submissionNumber: 'SUB-005', patientName: 'Michael Wilson', payer: 'BPJS', status: 'SUBMITTED', date: '2023-05-05' }
];

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Monitor insurance approval submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard 
          title="Total Submissions" 
          value={dashboardData.totalSubmissions} 
          icon={Users} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Pending Submissions" 
          value={dashboardData.pendingSubmissions} 
          icon={Clock} 
          color="bg-yellow-500" 
        />
        <StatCard 
          title="Approved" 
          value={dashboardData.approvedSubmissions} 
          icon={CheckCircle} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Rejected" 
          value={dashboardData.rejectedSubmissions} 
          icon={XCircle} 
          color="bg-red-500" 
        />
        <StatCard 
          title="Active Pending" 
          value={dashboardData.activePendingCount} 
          icon={Activity} 
          color="bg-orange-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Submissions by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pending Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Trend by Date</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pendingTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending Items" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Payer Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Payer Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={payerStatsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Submissions Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Submission Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="submissions" fill="#10b981" name="Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSubmissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.submissionNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${submission.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                            submission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                            submission.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {submission.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Latest Pending Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Pending Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">SUB-002 - John Doe</p>
                  <p className="text-sm text-gray-500">Added pending record for lab test</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">SUB-003 - Jane Smith</p>
                  <p className="text-sm text-gray-500">Resolved pending issue with medication</p>
                  <p className="text-xs text-gray-400 mt-1">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">SUB-005 - Robert Johnson</p>
                  <p className="text-sm text-gray-500">New pending for procedure approval</p>
                  <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}