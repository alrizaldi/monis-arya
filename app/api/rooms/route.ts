import { NextRequest, NextResponse } from 'next/server';
import { RoomService } from '@/services/roomService';

const roomService = new RoomService();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const roomNumber = url.searchParams.get('roomNumber') || '';
    const roomClass = url.searchParams.get('roomClass') || '';
    const bedNumberStr = url.searchParams.get('bedNumber') || '';
    const bedNumber = bedNumberStr ? parseInt(bedNumberStr) : undefined;

    const filters = {
      roomNumber: roomNumber || undefined,
      roomClass: roomClass || undefined,
      bedNumber: bedNumber,
    };

    const result = await roomService.getRoomsWithPagination({
      page,
      limit,
      filters,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch rooms' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const room = await roomService.createRoom({
      roomNumber: body.roomNumber,
      bedNumber: body.bedNumber,
      roomClass: body.roomClass
    });
    
    return NextResponse.json(room, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create room' }, 
      { status: 500 }
    );
  }
}