import { NextResponse } from 'next/server';
import { getRoom, saveRoom, getRandomQuizFromDb, saveMatchHistory } from '@/lib/db';
import { LADDERS, SNAKES, QUIZ_TILES, generateRandomQuizTiles } from '@/lib/board-config';

async function recordOnlineMatch(room: any) {
  if (room.status !== 'FINISHED' || !room.winner) return;
  try {
    await saveMatchHistory({
      id: `match-online-${room.code}-${Date.now()}`,
      mode: 'ONLINE',
      roomCode: room.code,
      winnerName: room.winner.name,
      winnerColor: room.winner.color,
      winnerAvatar: room.winner.avatar || '👑',
      totalTurns: room.winner.turnsTaken,
      totalPlayers: room.players.length,
      quizzesAnswered: room.winner.quizzesAnswered,
      quizzesCorrect: room.winner.quizzesCorrect,
      laddersClimbed: room.winner.laddersClimbed,
      snakesBitten: room.winner.snakesBitten,
      playersSummary: room.players.map((p: any) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        finalPosition: p.position,
        turnsTaken: p.turnsTaken,
        quizzesAnswered: p.quizzesAnswered,
        quizzesCorrect: p.quizzesCorrect,
        laddersClimbed: p.laddersClimbed,
        snakesBitten: p.snakesBitten,
      })),
    });
  } catch (e) {
    console.warn('[Action API] Gagal mencatat riwayat online:', e);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { action, playerId, isCorrect } = body;

    const room = await getRoom(code);
    if (!room) {
      return NextResponse.json({ error: 'Room tidak ditemukan.' }, { status: 404 });
    }

    // 1. ACTION: START_GAME (Hanya Host yang bisa memulai)
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

      // Cek aturan dadu 6
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

      // Hitung pergerakan bidak dengan aturan pantul balik dari 100
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

      // Cek Menang tepat di 100
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

      // Cek Tangga
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
          // Lanjut lempar jika dapat 6, atau ganti pemain
          if (!isSix) {
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

      // Cek Ular
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

        if (!isSix) {
          room.activePlayerIndex = (room.activePlayerIndex + 1) % room.players.length;
        }
        room.phase = 'WAIT_ROLL';
        room.version += 1;
        room.updatedAt = Date.now();
        await saveRoom(room);
        return NextResponse.json({ success: true, state: room });
      }

      // Cek Kuis (HANYA petak kuis yang terdaftar secara dinamis)
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

      // Petak biasa: jika dapat 6 tetap pemain aktif, jika tidak ganti pemain
      if (!isSix) {
        room.activePlayerIndex = (room.activePlayerIndex + 1) % room.players.length;
      }
      room.phase = 'WAIT_ROLL';
      room.version += 1;
      room.updatedAt = Date.now();
      await saveRoom(room);
      return NextResponse.json({ success: true, state: room });
    }

    // 3. ACTION: ANSWER_QUIZ
    if (action === 'ANSWER_QUIZ') {
      const activePlayer = room.players[room.activePlayerIndex];
      if (!activePlayer || activePlayer.id !== playerId) {
        return NextResponse.json({ error: 'Bukan giliran Anda untuk menjawab kuis!' }, { status: 403 });
      }

      activePlayer.quizzesAnswered += 1;
      room.currentQuiz = null;

      if (isCorrect) {
        activePlayer.quizzesCorrect += 1;
        let newPos = activePlayer.position + 2;
        if (newPos > 100) newPos = 100 - (newPos - 100);
        activePlayer.position = newPos;

        room.logs.unshift({
          id: `log-${Date.now()}-quiz-ok`,
          text: `✅ ${activePlayer.name} menjawab kuis dengan benar! Bonus maju +2 petak ke ${newPos}!`,
          type: 'quiz',
          timestamp: new Date().toISOString(),
        });

        if (newPos === 100) {
          room.winner = activePlayer;
          room.status = 'FINISHED';
          room.phase = 'GAME_OVER';
        } else {
          // Chain reaction: jika petak bonus ada tangga
          const bonusLadder = LADDERS.find((l) => l.start === newPos);
          if (bonusLadder) {
            activePlayer.position = bonusLadder.end;
            activePlayer.laddersClimbed += 1;
            room.logs.unshift({
              id: `log-${Date.now()}-bonus-ladder`,
              text: `🪜 Hebat! Bonus kuis membawa ${activePlayer.name} ke tangga petak ${bonusLadder.start} -> naik ke ${bonusLadder.end}!`,
              type: 'ladder',
              timestamp: new Date().toISOString(),
            });
            if (bonusLadder.end === 100) {
              room.winner = activePlayer;
              room.status = 'FINISHED';
              room.phase = 'GAME_OVER';
            }
          }
        }
      } else {
        const penaltyPos = Math.max(1, activePlayer.position - 1);
        activePlayer.position = penaltyPos;

        room.logs.unshift({
          id: `log-${Date.now()}-quiz-fail`,
          text: `❌ ${activePlayer.name} belum tepat menjawab kuis! Penalti mundur -1 petak ke ${penaltyPos}!`,
          type: 'quiz',
          timestamp: new Date().toISOString(),
        });

        // Chain reaction: jika petak penalti ada ular
        const penaltySnake = SNAKES.find((s) => s.start === penaltyPos);
        if (penaltySnake) {
          activePlayer.position = penaltySnake.end;
          activePlayer.snakesBitten += 1;
          room.logs.unshift({
            id: `log-${Date.now()}-penalty-snake`,
            text: `🐍 Awas! Penalti kuis menjatuhkan ${activePlayer.name} ke kepala ular di petak ${penaltySnake.start} -> meluncur ke ${penaltySnake.end}!`,
            type: 'snake',
            timestamp: new Date().toISOString(),
          });
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

    return NextResponse.json({ error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error) {
    console.error('Error handling room action:', error);
    return NextResponse.json({ error: 'Gagal memproses aksi permainan.' }, { status: 500 });
  }
}
