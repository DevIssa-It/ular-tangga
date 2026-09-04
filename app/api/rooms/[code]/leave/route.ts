import { NextResponse } from 'next/server';
import { getRoom, saveRoom, deleteRoom } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json().catch(() => ({}));
    const playerId = Number(body.playerId);
    const hostId = body.hostId;

    const room = await getRoom(code);
    if (!room) {
      return NextResponse.json({ success: true, message: 'Room tidak ditemukan.' });
    }

    const leavingIdx = room.players.findIndex((p) => p.id === playerId);
    if (leavingIdx === -1) {
      return NextResponse.json({ success: true, message: 'Pemain tidak ditemukan di room.', state: room });
    }

    const leavingPlayer = room.players[leavingIdx];
    const isHostLeaving = leavingPlayer.isHost || (hostId && room.hostId === hostId);

    // Hapus pemain dari room
    room.players.splice(leavingIdx, 1);

    // 1. Jika tidak ada pemain lagi yang tersisa di room, tutup/hapus room dari database
    if (room.players.length === 0) {
      await deleteRoom(code);
      return NextResponse.json({ success: true, roomClosed: true });
    }

    // 2. Jika Host keluar saat masih di LOBBY, serahkan kepemimpinan ke pemain berikutnya
    if (isHostLeaving && room.status === 'LOBBY') {
      room.players[0].isHost = true;
      room.logs.unshift({
        id: `log-${Date.now()}-host-left`,
        text: `👑 Host (${leavingPlayer.name}) keluar. Kepemimpinan room diserahkan kepada ${room.players[0].name}!`,
        type: 'info',
        timestamp: new Date().toISOString(),
      });
    } else {
      room.logs.unshift({
        id: `log-${Date.now()}-player-left`,
        text: `👋 ${leavingPlayer.name} (${leavingPlayer.avatar}) telah keluar dari room. (${room.players.length} pemain tersisa)`,
        type: 'info',
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Jika sedang bermain dan pemain yang keluar sedang giliran aktif
    if (room.status === 'PLAYING') {
      if (room.activePlayerIndex >= room.players.length) {
        room.activePlayerIndex = 0;
      }
    }

    room.version += 1;
    room.updatedAt = Date.now();
    await saveRoom(room);

    return NextResponse.json({ success: true, state: room });
  } catch (error) {
    console.error('Error leaving room:', error);
    return NextResponse.json({ error: 'Gagal memproses keluar room' }, { status: 500 });
  }
}
