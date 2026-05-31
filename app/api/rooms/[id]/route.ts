import { NextRequest, NextResponse } from "next/server";
import { RoomService } from "@/services/roomService";
import { getUserFromRequest } from "@/lib/authUtils";

const roomService = new RoomService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const room = await roomService.getRoomById(params.id);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const room = await roomService.updateRoom(
      params.id,
      {
        roomNumber: body.roomNumber,
        bedNumber: body.bedNumber,
        roomClass: body.roomClass,
      },
      user.email,
    );

    return NextResponse.json(room);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update room" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await roomService.deleteRoom(params.id, user.email);
    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 },
    );
  }
}
