import { NextRequest, NextResponse } from 'next/server';
import { PayerService } from '@/services/payerService';

const payerService = new PayerService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payer = await payerService.getPayerById(params.id);
    if (!payer) {
      return NextResponse.json({ error: 'Payer not found' }, { status: 404 });
    }
    return NextResponse.json(payer);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch payer' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const payer = await payerService.updatePayer(params.id, {
      payerName: body.payerName
    });
    
    return NextResponse.json(payer);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update payer' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await payerService.deletePayer(params.id);
    return NextResponse.json({ message: 'Payer deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete payer' }, 
      { status: 500 }
    );
  }
}