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

    const room = await getRoom(code);
    if (!room) {
      return NextResponse.json(
        { error: `Room ${code} tidak ditemukan.` },
        { status: 404 }
      );
    }

    if (room.players.length >= 6) {
      return NextResponse.json(
        { error: 'Room sudah penuh (maksimal 6 pemain).' },
        { status: 400 }
      );
    }

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
    });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json(
      { error: 'Gagal bergabung ke room' },
      { status: 500 }
    );
  }
}
