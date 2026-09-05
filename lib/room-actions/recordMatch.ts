import { saveMatchHistory } from '@/lib/db';
import { OnlineRoomState } from '@/lib/types';

export async function recordOnlineMatch(room: OnlineRoomState) {
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
      playersSummary: room.players.map((p) => ({
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
