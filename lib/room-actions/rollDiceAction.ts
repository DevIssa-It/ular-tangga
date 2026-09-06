import { NextResponse } from 'next/server';
import { OnlineRoomState } from '@/lib/types';
import { saveRoom, getRandomQuizFromDb } from '@/lib/db';
import { LADDERS, SNAKES, QUIZ_TILES } from '@/lib/board-config';
import { recordOnlineMatch } from './recordMatch';

export async function handleRollDiceAction(room: OnlineRoomState, playerId: number) {
  const activePlayer = room.players[room.activePlayerIndex];
  if (!activePlayer || activePlayer.id !== playerId) {
    return NextResponse.json({ error: 'Bukan giliran Anda untuk melempar dadu!' }, { status: 403 });
  }
  if (room.phase !== 'WAIT_ROLL') {
    return NextResponse.json({ error: 'Sedang tidak dalam fase lempar dadu.' }, { status: 400 });
  }

  const dice = Math.floor(Math.random() * 6) + 1;
  room.diceValue = dice;
  activePlayer.turnsTaken += 1;

  const isSix = dice === 6;
  const nextSixes = isSix ? room.consecutiveSixes + 1 : 0;

  if (isSix && nextSixes >= 3) {
    room.consecutiveSixes = 0;
    room.lastRolledSix = false;
    room.logs.unshift({
      id: `log-${Date.now()}`,
      text: `⚠️ ${activePlayer.name} melempar angka 6 sebanyak 3 kali berturut-turut! Lemparan dibatalkan dan giliran berganti.`,
      type: 'info',
      timestamp: new Date().toISOString(),
    });
    room.activePlayerIndex = (room.activePlayerIndex + 1) % room.players.length;
    room.phase = 'WAIT_ROLL';
    room.version += 1;
    room.updatedAt = Date.now();
    await saveRoom(room);
    return NextResponse.json({ success: true, state: room });
  }

  room.consecutiveSixes = nextSixes;
  room.lastRolledSix = isSix;

  let currentPos = activePlayer.position;
  let forward = true;
  for (let i = 0; i < dice; i++) {
    if (currentPos >= 100) forward = false;
    currentPos = forward ? currentPos + 1 : currentPos - 1;
  }
  activePlayer.position = currentPos;

  room.logs.unshift({
    id: `log-${Date.now()}`,
    text: `${activePlayer.name} melempar dadu: ${dice} 🎲 -> Petak ${currentPos}`,
    type: 'info',
    timestamp: new Date().toISOString(),
  });

  if (isSix) {
    room.logs.unshift({
      id: `log-${Date.now()}-bonus`,
      text: `🎉 Angka 6! ${activePlayer.name} berhak melempar dadu sekali lagi!`,
      type: 'info',
      timestamp: new Date().toISOString(),
    });
  }

  if (currentPos === 100) {
    room.winner = activePlayer;
    room.status = 'FINISHED';
    room.phase = 'GAME_OVER';
    room.logs.unshift({
      id: `log-${Date.now()}-win`,
      text: `🏆 ${activePlayer.name} MENANG! Berhasil mencapai Petak 100!`,
      type: 'win',
      timestamp: new Date().toISOString(),
    });
    room.version += 1;
    room.updatedAt = Date.now();
    await recordOnlineMatch(room);
    await saveRoom(room);
    return NextResponse.json({ success: true, state: room });
  }

  const ladder = LADDERS.find((l) => l.start === currentPos);
  if (ladder) {
    activePlayer.position = ladder.end;
    activePlayer.laddersClimbed += 1;
    room.logs.unshift({
      id: `log-${Date.now()}-ladder`,
      text: `🪜 Hore! ${activePlayer.name} naik tangga dari petak ${ladder.start} ke ${ladder.end}!`,
      type: 'ladder',
      timestamp: new Date().toISOString(),
    });

    if (ladder.end === 100) {
      room.winner = activePlayer;
      room.status = 'FINISHED';
      room.phase = 'GAME_OVER';
    } else {
      const isQuizAfterLadder = room.quizTiles ? room.quizTiles.includes(ladder.end) : QUIZ_TILES.has(ladder.end);
      if (isQuizAfterLadder) {
        const quiz = await getRandomQuizFromDb();
        room.currentQuiz = quiz;
        room.phase = 'QUIZ_ACTIVE';
        room.logs.unshift({
          id: `log-${Date.now()}-ladder-quiz`,
          text: `❓ Tangga membawa ${activePlayer.name} ke petak Kuis ${ladder.end}! Kategori: ${quiz.category}`,
          type: 'quiz',
          timestamp: new Date().toISOString(),
        });
      } else {
        if (!isSix) room.activePlayerIndex = (room.activePlayerIndex + 1) % room.players.length;
        room.phase = 'WAIT_ROLL';
      }
    }

    room.version += 1;
    room.updatedAt = Date.now();
    if (room.status === 'FINISHED') await recordOnlineMatch(room);
    await saveRoom(room);
    return NextResponse.json({ success: true, state: room });
  }

  const snake = SNAKES.find((s) => s.start === currentPos);
  if (snake) {
    activePlayer.position = snake.end;
    activePlayer.snakesBitten += 1;
    room.logs.unshift({
      id: `log-${Date.now()}-snake`,
      text: `🐍 Ups! ${activePlayer.name} digigit ular di petak ${snake.start} dan meluncur ke petak ${snake.end}!`,
      type: 'snake',
      timestamp: new Date().toISOString(),
    });

    const isQuizAfterSnake = room.quizTiles ? room.quizTiles.includes(snake.end) : QUIZ_TILES.has(snake.end);
    if (isQuizAfterSnake) {
      const quiz = await getRandomQuizFromDb();
      room.currentQuiz = quiz;
      room.phase = 'QUIZ_ACTIVE';
      room.logs.unshift({
        id: `log-${Date.now()}-snake-quiz`,
        text: `❓ Ular menjatuhkan ${activePlayer.name} ke petak Kuis ${snake.end}! Kategori: ${quiz.category}`,
        type: 'quiz',
        timestamp: new Date().toISOString(),
      });
    } else {
      if (!isSix) room.activePlayerIndex = (room.activePlayerIndex + 1) % room.players.length;
      room.phase = 'WAIT_ROLL';
    }
    room.version += 1;
    room.updatedAt = Date.now();
    await saveRoom(room);
    return NextResponse.json({ success: true, state: room });
  }

  const isQuizTile = room.quizTiles
    ? room.quizTiles.includes(currentPos)
    : QUIZ_TILES.has(currentPos);

  if (isQuizTile) {
    const quiz = await getRandomQuizFromDb();
    room.currentQuiz = quiz;
    room.phase = 'QUIZ_ACTIVE';
    room.logs.unshift({
      id: `log-${Date.now()}-quiz`,
      text: `❓ ${activePlayer.name} mendarat di petak Kuis ${currentPos}! Kategori: ${quiz.category}`,
      type: 'quiz',
      timestamp: new Date().toISOString(),
    });
    room.version += 1;
    room.updatedAt = Date.now();
    await saveRoom(room);
    return NextResponse.json({ success: true, state: room });
  }

  if (!isSix) room.activePlayerIndex = (room.activePlayerIndex + 1) % room.players.length;
  room.phase = 'WAIT_ROLL';
  room.version += 1;
  room.updatedAt = Date.now();
  await saveRoom(room);
  return NextResponse.json({ success: true, state: room });
}
