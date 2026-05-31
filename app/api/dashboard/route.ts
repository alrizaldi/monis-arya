import { NextRequest, NextResponse } from 'next/server';
import { DashboardService } from '@/services/dashboardService';
import { getUserFromRequest } from '@/lib/authUtils';

const dashboardService = new DashboardService();

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dashboardData = await dashboardService.getDashboardData();
    
    return NextResponse.json(dashboardData);
  } catch (error: any) {
    console.error('Error in GET /api/dashboard:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' }, 
      { status: 500 }
    );
  }
}