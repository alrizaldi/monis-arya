import { NextRequest, NextResponse } from 'next/server';
import { RoomService } from '@/services/roomService';
import { getUserFromRequest } from '@/lib/authUtils';

const roomService = new RoomService();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const roomNumber = url.searchParams.get('roomNumber') || '';
    const roomClass = url.searchParams.get('roomClass') || '';
    const bedNumber = url.searchParams.get('bedNumber') || '';

    const filters = {
      roomNumber: roomNumber || undefined,
      roomClass: roomClass || undefined,
      bedNumber: bedNumber ? parseInt(bedNumber) : undefined,
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
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const room = await roomService.createRoom({
      roomNumber: body.roomNumber,
      bedNumber: body.bedNumber,
      roomClass: body.roomClass,
    }, user.email);
    
    return NextResponse.json(room, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create room' }, 
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
    const roomId = url.pathname.split('/').pop(); // Extract ID from URL
    
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    const room = await roomService.updateRoom(
      roomId,
      {
        roomNumber: body.roomNumber,
        bedNumber: body.bedNumber,
        roomClass: body.roomClass,
      },
      user.email
    );
    
    return NextResponse.json(room);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update room' }, 
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
    const roomId = url.pathname.split('/').pop(); // Extract ID from URL
    
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }

    await roomService.deleteRoom(roomId, user.email);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete room' }, 
      { status: 500 }
    );
  }
}