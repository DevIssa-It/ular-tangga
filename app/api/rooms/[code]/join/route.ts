import { NextResponse } from 'next/server';
import { getRoom, saveRoom } from '@/lib/db';
import { Player } from '@/lib/types';
import { DEFAULT_PLAYER_PRESETS } from '@/lib/board-config';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json().catch(() => ({}));
    const playerName = (body.name || 'Pemain').trim();
    const playerAvatar = body.avatar || '🦊';
    const existingPlayerId = body.playerId ? Number(body.playerId) : null;
    const hostId = body.hostId;

    const room = await getRoom(code);
    if (!room) {
      return NextResponse.json(
        { error: `Room ${code} tidak ditemukan.` },
        { status: 404 }
      );
    }

    // 1. Cek apakah pemain ingin bergabung kembali (Reconnect via playerId)
    if (existingPlayerId) {
      const existingPlayer = room.players.find((p) => p.id === existingPlayerId);
      if (existingPlayer) {
        return NextResponse.json({
          success: true,
          player: existingPlayer,
          state: room,
          reconnected: true,
        });
      }
    }

    // 2. Cek apakah ini Host asli yang bergabung kembali (Reconnect via hostId)
    if (hostId && room.hostId === hostId) {
      const hostPlayer = room.players.find((p) => p.isHost) || room.players[0];
      if (hostPlayer) {
        return NextResponse.json({
          success: true,
          player: hostPlayer,
          state: room,
          reconnected: true,
        });
      }
    }

    // 3. Cek apakah ada pemain dengan nama yang sama di room (hindari duplikasi slot)
    const sameNamePlayer = room.players.find(
      (p) => p.name.trim().toLowerCase() === playerName.toLowerCase()
    );
    if (sameNamePlayer) {
      return NextResponse.json({
        success: true,
        player: sameNamePlayer,
        state: room,
        reconnected: true,
      });
    }

    // 4. Jika room sudah penuh
    if (room.players.length >= 6) {
      return NextResponse.json(
        { error: 'Room sudah penuh (maksimal 6 pemain).' },
        { status: 400 }
      );
    }

    // 5. Daftarkan pemain baru jika memang belum pernah ada
    const nextId = room.players.length + 1;
    const nextPreset = DEFAULT_PLAYER_PRESETS[(nextId - 1) % DEFAULT_PLAYER_PRESETS.length];

    const newPlayer: Player = {
      id: nextId,
      name: playerName,
      color: nextPreset.color,
      avatar: playerAvatar,
      position: 1,
      previousPosition: 1,
      quizzesAnswered: 0,
      quizzesCorrect: 0,
      laddersClimbed: 0,
      snakesBitten: 0,
      turnsTaken: 0,
      isHost: false,
    };

    room.players.push(newPlayer);
    room.logs.unshift({
      id: `log-${Date.now()}`,
      text: `👋 ${playerName} (${playerAvatar}) bergabung ke room! (${room.players.length}/6 pemain)`,
      type: 'info',
      timestamp: new Date().toISOString(),
    });
    room.version += 1;
    room.updatedAt = Date.now();

    await saveRoom(room);

    return NextResponse.json({
      success: true,
      player: newPlayer,
      state: room,
      reconnected: false,
    });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json(
      { error: 'Gagal bergabung ke room' },
      { status: 500 }
    );
  }
}
