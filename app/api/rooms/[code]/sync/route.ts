import { NextResponse } from 'next/server';
import { getRoom } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const room = await getRoom(code);

    if (!room) {
      return NextResponse.json({ error: 'Room tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      version: room.version,
      updatedAt: room.updatedAt,
      state: room,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal sinkronisasi room' }, { status: 500 });
  }
}
