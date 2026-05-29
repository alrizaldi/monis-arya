import { NextRequest, NextResponse } from 'next/server';
import { RoomService } from '@/services/roomService';

const roomService = new RoomService();

export async function GET(request: NextRequest) {
  try {
    const rooms = await roomService.getAllRooms();
    return NextResponse.json(rooms);
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