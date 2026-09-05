import { NextResponse } from 'next/server';
import { getRoom, saveRoom } from '@/lib/db';
import { generateRandomQuizTiles } from '@/lib/board-config';
import { handleRollDiceAction } from '@/lib/room-actions/rollDiceAction';
import { handleQuizAction } from '@/lib/room-actions/quizAction';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { action, playerId, isCorrect, text } = body;

    const room = await getRoom(code);
    if (!room) {
      return NextResponse.json({ error: 'Room tidak ditemukan.' }, { status: 404 });
    }

    // 1. ACTION: START_GAME
    if (action === 'START_GAME') {
      if (room.players.length < 2) {
        return NextResponse.json({ error: 'Minimal 2 pemain untuk memulai permainan.' }, { status: 400 });
      }
      room.status = 'PLAYING';
      room.phase = 'WAIT_ROLL';
      room.activePlayerIndex = 0;
      if (!room.quizTiles || room.quizTiles.length === 0) {
        room.quizTiles = generateRandomQuizTiles();
      }
      room.logs.unshift({
        id: `log-${Date.now()}`,
        text: `🚀 Permainan dimulai dengan ${room.players.length} pemain! Giliran pertama: ${room.players[0].name}.`,
        type: 'info',
        timestamp: new Date().toISOString(),
      });
      room.version += 1;
      room.updatedAt = Date.now();
      await saveRoom(room);
      return NextResponse.json({ success: true, state: room });
    }

    // 2. ACTION: ROLL_DICE
    if (action === 'ROLL_DICE') {
      return await handleRollDiceAction(room, playerId);
    }

    // 3. ACTION: ANSWER_QUIZ
    if (action === 'ANSWER_QUIZ') {
      return await handleQuizAction(room, playerId, isCorrect);
    }

    // 4. ACTION: REMATCH
    if (action === 'REMATCH') {
      room.players = room.players.map((p) => ({
        ...p,
        position: 1,
        previousPosition: 1,
        turnsTaken: 0,
        quizzesAnswered: 0,
        quizzesCorrect: 0,
        laddersClimbed: 0,
        snakesBitten: 0,
      }));
      room.activePlayerIndex = 0;
      room.status = 'PLAYING';
      room.phase = 'WAIT_ROLL';
      room.winner = null;
      room.currentQuiz = null;
      room.consecutiveSixes = 0;
      room.lastRolledSix = false;
      room.quizTiles = generateRandomQuizTiles();
      room.logs.unshift({
        id: `log-${Date.now()}-rematch`,
        text: '🔥 Pertandingan ulang dimulai! Siapakah yang akan menang?',
        type: 'info',
        timestamp: new Date().toISOString(),
      });
      room.version += 1;
      room.updatedAt = Date.now();
      await saveRoom(room);
      return NextResponse.json({ success: true, state: room });
    }

    // 5. ACTION: SEND_TAUNT
    if (action === 'SEND_TAUNT') {
      const sender = room.players.find((p) => p.id === playerId);
      if (!sender) {
        return NextResponse.json({ error: 'Pemain tidak ditemukan.' }, { status: 404 });
      }
      const cleanText = (typeof text === 'string' ? text.trim() : '').slice(0, 60);
      if (!cleanText) {
        return NextResponse.json({ error: 'Pesan tidak boleh kosong.' }, { status: 400 });
      }
      const taunt = {
        playerId: sender.id,
        senderName: sender.name,
        text: cleanText,
        timestamp: Date.now(),
      };
      room.lastTaunt = taunt;
      room.logs.unshift({
        id: `log-taunt-${Date.now()}`,
        text: `💬 ${sender.name}: "${cleanText}"`,
        type: 'info',
        timestamp: new Date().toISOString(),
      });
      room.version += 1;
      room.updatedAt = Date.now();
      await saveRoom(room);
      return NextResponse.json({ success: true, state: room, taunt });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error) {
    console.error('Error handling room action:', error);
    return NextResponse.json({ error: 'Gagal memproses aksi permainan.' }, { status: 500 });
  }
}
