import { NextRequest, NextResponse } from 'next/server';
import { PayerService } from '@/services/payerService';
import { getUserFromRequest } from '@/lib/authUtils';

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
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const payer = await payerService.createPayer({
      payerName: body.payerName,
    }, user.email);
    
    return NextResponse.json(payer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create payer' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const payerId = url.pathname.split('/').pop(); // Extract ID from URL
    
    if (!payerId) {
      return NextResponse.json({ error: 'Payer ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    const payer = await payerService.updatePayer(
      payerId,
      {
        payerName: body.payerName,
      },
      user.email
    );
    
    return NextResponse.json(payer);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update payer' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const payerId = url.pathname.split('/').pop(); // Extract ID from URL
    
    if (!payerId) {
      return NextResponse.json({ error: 'Payer ID is required' }, { status: 400 });
    }

    await payerService.deletePayer(payerId, user.email);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete payer' }, 
      { status: 500 }
    );
  }
}