import { NextResponse } from 'next/server';
import { OnlineRoomState } from '@/lib/types';
import { saveRoom } from '@/lib/db';
import { LADDERS, SNAKES } from '@/lib/board-config';
import { recordOnlineMatch } from './recordMatch';

export async function handleQuizAction(
  room: OnlineRoomState,
  playerId: number,
  isCorrect: boolean
) {
  const activePlayer = room.players[room.activePlayerIndex];
  if (!activePlayer || activePlayer.id !== playerId) {
    return NextResponse.json({ error: 'Bukan giliran Anda untuk menjawab kuis!' }, { status: 403 });
  }

  activePlayer.quizzesAnswered += 1;
  room.currentQuiz = null;

  let targetPos = activePlayer.position;
  if (isCorrect) {
    activePlayer.quizzesCorrect += 1;
    let newPos = activePlayer.position + 2;
    if (newPos > 100) newPos = 100 - (newPos - 100);
    activePlayer.position = newPos;
    targetPos = newPos;

    room.logs.unshift({
      id: `log-${Date.now()}-quiz-ok`,
      text: `✅ ${activePlayer.name} menjawab kuis dengan benar! Maju +2 petak ke ${newPos}!`,
      type: 'quiz',
      timestamp: new Date().toISOString(),
    });
  } else {
    const penaltyPos = Math.max(1, activePlayer.position - 1);
    activePlayer.position = penaltyPos;
    targetPos = penaltyPos;

    room.logs.unshift({
      id: `log-${Date.now()}-quiz-fail`,
      text: `❌ ${activePlayer.name} belum tepat menjawab kuis! Mundur -1 petak ke ${penaltyPos}!`,
      type: 'quiz',
      timestamp: new Date().toISOString(),
    });
  }

  if (targetPos === 100) {
    room.winner = activePlayer;
    room.status = 'FINISHED';
    room.phase = 'GAME_OVER';
  } else {
    const ladder = LADDERS.find((l) => l.start === targetPos);
    if (ladder) {
      activePlayer.position = ladder.end;
      activePlayer.laddersClimbed += 1;
      room.logs.unshift({
        id: `log-${Date.now()}-bonus-ladder`,
        text: `🪜 Hebat! Reaksi kuis membawa ${activePlayer.name} ke tangga ${ladder.start} -> naik ke ${ladder.end}!`,
        type: 'ladder',
        timestamp: new Date().toISOString(),
      });
      if (ladder.end === 100) {
        room.winner = activePlayer;
        room.status = 'FINISHED';
        room.phase = 'GAME_OVER';
      }
    } else {
      const snake = SNAKES.find((s) => s.start === targetPos);
      if (snake) {
        activePlayer.position = snake.end;
        activePlayer.snakesBitten += 1;
        room.logs.unshift({
          id: `log-${Date.now()}-penalty-snake`,
          text: `🐍 Ups! Reaksi kuis menjatuhkan ${activePlayer.name} ke ular ${snake.start} -> meluncur ke ${snake.end}!`,
          type: 'snake',
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  if (room.status !== 'FINISHED') {
    if (!room.lastRolledSix) {
      room.activePlayerIndex = (room.activePlayerIndex + 1) % room.players.length;
    }
    room.phase = 'WAIT_ROLL';
  }

  room.version += 1;
  room.updatedAt = Date.now();
  if (room.status === 'FINISHED') await recordOnlineMatch(room);
  await saveRoom(room);
  return NextResponse.json({ success: true, state: room });
}
