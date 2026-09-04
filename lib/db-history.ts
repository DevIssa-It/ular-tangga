import { getDatabase } from './db';
import { MatchRecord } from './types';

let historyTableInitialized = false;

export async function initHistoryTable() {
  if (historyTableInitialized) return;
  const sql = getDatabase();
  if (!sql) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS game_matches (
        id VARCHAR(64) PRIMARY KEY,
        mode VARCHAR(16) NOT NULL,
        room_code VARCHAR(16),
        winner_name VARCHAR(64) NOT NULL,
        winner_color VARCHAR(16) NOT NULL,
        winner_avatar VARCHAR(32) NOT NULL,
        total_turns INTEGER NOT NULL,
        total_players INTEGER NOT NULL,
        quizzes_answered INTEGER DEFAULT 0,
        quizzes_correct INTEGER DEFAULT 0,
        ladders_climbed INTEGER DEFAULT 0,
        snakes_bitten INTEGER DEFAULT 0,
        players_summary JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    historyTableInitialized = true;
  } catch (err) {
    console.warn('[Neon DB] Warning init history table:', err);
  }
}

export async function saveMatchHistory(match: MatchRecord): Promise<boolean> {
  const sql = getDatabase();
  if (!sql) return false;

  try {
    await initHistoryTable();
    await sql`
      INSERT INTO game_matches (
        id, mode, room_code, winner_name, winner_color, winner_avatar,
        total_turns, total_players, quizzes_answered, quizzes_correct,
        ladders_climbed, snakes_bitten, players_summary
      ) VALUES (
        ${match.id},
        ${match.mode},
        ${match.roomCode || null},
        ${match.winnerName},
        ${match.winnerColor},
        ${match.winnerAvatar},
        ${match.totalTurns},
        ${match.totalPlayers},
        ${match.quizzesAnswered},
        ${match.quizzesCorrect},
        ${match.laddersClimbed},
        ${match.snakesBitten},
        ${JSON.stringify(match.playersSummary)}::jsonb
      );
    `;
    return true;
  } catch (err) {
    console.error('[Neon DB] Error saveMatchHistory:', err);
    return false;
  }
}

export async function getMatchHistory(limit = 15): Promise<MatchRecord[]> {
  const sql = getDatabase();
  if (!sql) return [];

  try {
    await initHistoryTable();
    const rows = await sql`
      SELECT * FROM game_matches
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;

    return rows.map((r: any) => ({
      id: r.id,
      mode: r.mode,
      roomCode: r.room_code,
      winnerName: r.winner_name,
      winnerColor: r.winner_color,
      winnerAvatar: r.winner_avatar,
      totalTurns: r.total_turns,
      totalPlayers: r.total_players,
      quizzesAnswered: r.quizzes_answered,
      quizzesCorrect: r.quizzes_correct,
      laddersClimbed: r.ladders_climbed,
      snakesBitten: r.snakes_bitten,
      playersSummary: typeof r.players_summary === 'string' ? JSON.parse(r.players_summary) : r.players_summary,
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.warn('[Neon DB] Error getMatchHistory:', err);
    return [];
  }
}

export async function getLeaderboardStats(): Promise<{ winnerName: string; wins: number; totalQuizzes: number }[]> {
  const sql = getDatabase();
  if (!sql) return [];

  try {
    await initHistoryTable();
    const rows = await sql`
      SELECT 
        winner_name,
        COUNT(*)::int as wins,
        SUM(quizzes_correct)::int as total_quizzes
      FROM game_matches
      GROUP BY winner_name
      ORDER BY wins DESC, total_quizzes DESC
      LIMIT 10;
    `;

    return rows.map((r: any) => ({
      winnerName: r.winner_name,
      wins: r.wins,
      totalQuizzes: r.total_quizzes || 0,
    }));
  } catch (err) {
    console.warn('[Neon DB] Error getLeaderboardStats:', err);
    return [];
  }
}
