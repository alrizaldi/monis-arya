"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Users,
  Bed,
  Building,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
} from "lucide-react";
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
  Cell,
} from "recharts";

interface DashboardStats {
  totalPatients: number;
  totalRooms: number;
  totalPayers: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  totalPendingRecords: number;
  activePendingRecords: number;
}

interface RecentActivity {
  id: string;
  moduleName: string;
  actionType: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

interface SubmissionTrend {
  date: string;
  submissions: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface ModuleActivity {
  name: string;
  count: number;
  color: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  submissionTrends: SubmissionTrend[];
  moduleActivity: ModuleActivity[];
}

export default function DashboardPage() {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  useEffect(() => {
    // Load dashboard data from API
    const loadDashboardData = async () => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/dashboard", {
          credentials: "include", // Include credentials (cookies) in the request
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data: DashboardData = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // In case of error, we could show some default values
        // For now, we'll just log the error
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      loadDashboardData();
    }
  }, [session]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-screen">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Colors for pie chart segments
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session?.user?.email}</p>
        </div>
        <div className="flex space-x-3">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Calendar className="h-4 w-4 mr-2" />
            Today's Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total Patients
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {dashboardData?.stats.totalPatients || 0}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Registered patients in system
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Total Rooms
            </CardTitle>
            <Bed className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {dashboardData?.stats.totalRooms || 0}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Hospital rooms available
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Total Payers
            </CardTitle>
            <Building className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {dashboardData?.stats.totalPayers || 0}
            </div>
            <p className="text-xs text-purple-600 mt-1">Insurance providers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              Total Submissions
            </CardTitle>
            <FileText className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {dashboardData?.stats.totalSubmissions || 0}
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Insurance claims processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Submission Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">
              Pending Submissions
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {dashboardData?.stats.pendingSubmissions || 0}
            </div>
            <p className="text-xs text-yellow-600 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Approved Claims
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {dashboardData?.stats.approvedSubmissions || 0}
            </div>
            <p className="text-xs text-green-600 mt-1">Successfully approved</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              Rejected Claims
            </CardTitle>
            <XCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {dashboardData?.stats.rejectedSubmissions || 0}
            </div>
            <p className="text-xs text-red-600 mt-1">
              Claims that were rejected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Submission Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Submission Trends (Last 7 Days)
            </CardTitle>
            <CardDescription>
              Weekly submission activity overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData?.submissionTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="submissions"
                    name="Total Submissions"
                    fill="#4f46e5"
                  />
                  <Bar dataKey="approved" name="Approved" fill="#10b981" />
                  <Bar dataKey="pending" name="Pending" fill="#f59e0b" />
                  <Bar dataKey="rejected" name="Rejected" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Module Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
              Activity by Module
            </CardTitle>
            <CardDescription>
              Distribution of activities across system modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData?.moduleActivity || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {(dashboardData?.moduleActivity || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ),
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Pending Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-indigo-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(dashboardData?.recentActivity || [])
                .slice(0, 5)
                .map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start pb-4 last:pb-0"
                  >
                    <div
                      className={`mr-3 mt-1 h-2 w-2 rounded-full ${
                        activity.actionType.includes("CREATE")
                          ? "bg-green-500"
                          : activity.actionType.includes("UPDATE")
                            ? "bg-blue-500"
                            : activity.actionType.includes("APPROVE")
                              ? "bg-teal-500"
                              : activity.actionType.includes("REJECT")
                                ? "bg-red-500"
                                : "bg-amber-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.moduleName} • {activity.createdBy}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              {(!dashboardData?.recentActivity ||
                dashboardData.recentActivity.length === 0) && (
                <p className="text-gray-500 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
              Pending Alerts
            </CardTitle>
            <CardDescription>
              Critical pending items requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-yellow-800">
                    Active Pending Records
                  </p>
                  <p className="text-sm text-yellow-600">Currently in review</p>
                </div>
                <span className="text-lg font-bold text-yellow-700">
                  {dashboardData?.stats.activePendingRecords || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-800">Overdue Reviews</p>
                  <p className="text-sm text-red-600">Pending {">"} 7 days</p>
                </div>
                <span className="text-lg font-bold text-red-700">5</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-blue-800">
                    Pending Submissions
                  </p>
                  <p className="text-sm text-blue-600">Awaiting action</p>
                </div>
                <span className="text-lg font-bold text-blue-700">
                  {dashboardData?.stats.pendingSubmissions || 0}
                </span>
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  View All Pending Items
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24"
              >
                <Users className="h-8 w-8 mb-2 text-blue-600" />
                <span>Patient Management</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24"
              >
                <FileText className="h-8 w-8 mb-2 text-green-600" />
                <span>Create Submission</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24"
              >
                <Clock className="h-8 w-8 mb-2 text-amber-600" />
                <span>Pending Review</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24"
              >
                <AlertTriangle className="h-8 w-8 mb-2 text-red-600" />
                <span>Audit Logs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
