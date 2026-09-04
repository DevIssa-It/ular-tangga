import { NextResponse } from 'next/server';
import { saveMatchHistory, getMatchHistory, getLeaderboardStats } from '@/lib/db';
import { MatchRecord } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '15', 10);
  const leaderboardOnly = searchParams.get('leaderboard') === 'true';

  try {
    if (leaderboardOnly) {
      const leaderboard = await getLeaderboardStats();
      return NextResponse.json({ success: true, leaderboard });
    }

    const [history, leaderboard] = await Promise.all([
      getMatchHistory(limit),
      getLeaderboardStats(),
    ]);

    return NextResponse.json({
      success: true,
      history,
      leaderboard,
    });
  } catch (err: any) {
    console.error('[API History] Error GET:', err);
    return NextResponse.json({ success: false, error: 'Gagal memuat riwayat' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const match: MatchRecord = {
      id: body.id || `match-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      mode: body.mode || 'LOCAL',
      roomCode: body.roomCode,
      winnerName: body.winnerName,
      winnerColor: body.winnerColor,
      winnerAvatar: body.winnerAvatar,
      totalTurns: body.totalTurns,
      totalPlayers: body.totalPlayers,
      quizzesAnswered: body.quizzesAnswered || 0,
      quizzesCorrect: body.quizzesCorrect || 0,
      laddersClimbed: body.laddersClimbed || 0,
      snakesBitten: body.snakesBitten || 0,
      playersSummary: body.playersSummary || [],
    };

    const ok = await saveMatchHistory(match);
    return NextResponse.json({ success: ok, matchId: match.id });
  } catch (err: any) {
    console.error('[API History] Error POST:', err);
    return NextResponse.json({ success: false, error: 'Gagal mencatat riwayat' }, { status: 500 });
  }
}
