import { NextRequest, NextResponse } from 'next/server';
import { PayerService } from '@/services/payerService';

const payerService = new PayerService();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const payerName = url.searchParams.get('payerName') || '';

    const filters = {
      payerName: payerName || undefined,
    };

    const result = await payerService.getPayersWithPagination({
      page,
      limit,
      filters,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch payers' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const payer = await payerService.createPayer({
      payerName: body.payerName
    });
    
    return NextResponse.json(payer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create payer' }, 
      { status: 500 }
    );
  }
}