import { NextResponse } from 'next/server';
import { saveRoom } from '@/lib/db';
import { OnlineRoomState, Player } from '@/lib/types';
import { DEFAULT_PLAYER_PRESETS, generateRandomQuizTiles } from '@/lib/board-config';

// Generator kode room unik 6 karakter (contoh: ULAR-84)
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ULAR-${result}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const hostName = (body.name || 'Host').trim();
    const hostAvatar = body.avatar || '🦁';

    const roomCode = generateRoomCode();
    const hostId = `host-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const hostPlayer: Player = {
      id: 1,
      name: hostName,
      color: DEFAULT_PLAYER_PRESETS[0].color,
      avatar: hostAvatar,
      position: 1,
      previousPosition: 1,
      quizzesAnswered: 0,
      quizzesCorrect: 0,
      laddersClimbed: 0,
      snakesBitten: 0,
      turnsTaken: 0,
      isHost: true,
    };

    const newRoomState: OnlineRoomState = {
      code: roomCode,
      hostId,
      status: 'LOBBY',
      players: [hostPlayer],
      activePlayerIndex: 0,
      diceValue: 1,
      phase: 'WAIT_ROLL',
      currentQuiz: null,
      winner: null,
      logs: [
        {
          id: `log-${Date.now()}`,
          text: `Room ${roomCode} dibuat oleh ${hostName}! Menunggu pemain lain bergabung...`,
          type: 'info',
          timestamp: new Date().toISOString(),
        },
      ],
      consecutiveSixes: 0,
      lastRolledSix: false,
      version: 1,
      updatedAt: Date.now(),
      quizTiles: generateRandomQuizTiles(),
    };

    await saveRoom(newRoomState);

    return NextResponse.json({
      success: true,
      roomCode,
      hostId,
      player: hostPlayer,
      state: newRoomState,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Gagal membuat room permainan' },
      { status: 500 }
    );
  }
}
