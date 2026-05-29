import { NextRequest, NextResponse } from 'next/server';
import { PayerService } from '@/services/payerService';

const payerService = new PayerService();

export async function GET(request: NextRequest) {
  try {
    const payers = await payerService.getAllPayers();
    return NextResponse.json(payers);
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