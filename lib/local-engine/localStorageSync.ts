'use client';

import { useEffect, useRef } from 'react';
import { Player, GamePhase, GameLogEntry } from '@/lib/types';

interface PersistenceProps {
  isLoaded: boolean;
  isLocalActive: boolean;
  phase: GamePhase;
  players: Player[];
  activePlayerIndex: number;
  diceValue: number;
  logs: GameLogEntry[];
  winner: Player | null;
  quizTiles: number[];
}

export function useLocalPersistence({
  isLoaded,
  isLocalActive,
  phase,
  players,
  activePlayerIndex,
  diceValue,
  logs,
  winner,
  quizTiles,
}: PersistenceProps) {
  const savedMatchRef = useRef<string | null>(null);

  // Simpan otomatis ke localStorage
  useEffect(() => {
    if (!isLoaded || !isLocalActive || players.length === 0) return;
    try {
      localStorage.setItem('snakes_ladders_save_v1', JSON.stringify({
        players, activePlayerIndex, diceValue, logs: logs.slice(0, 30), winner, quizTiles, savedAt: Date.now(),
      }));
    } catch {}
  }, [players, activePlayerIndex, diceValue, logs, winner, isLoaded, isLocalActive, quizTiles]);

  // Simpan riwayat kemenangan ke database Neon DB
  useEffect(() => {
    if (phase === 'GAME_OVER' && winner && isLocalActive) {
      const matchKey = `${winner.id}-${winner.turnsTaken}`;
      if (savedMatchRef.current === matchKey) return;
      savedMatchRef.current = matchKey;
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'LOCAL', winnerName: winner.name, winnerColor: winner.color, winnerAvatar: winner.avatar,
          totalTurns: winner.turnsTaken, totalPlayers: players.length, quizzesAnswered: winner.quizzesAnswered,
          quizzesCorrect: winner.quizzesCorrect, laddersClimbed: winner.laddersClimbed, snakesBitten: winner.snakesBitten,
          playersSummary: players.map((p) => ({ ...p, finalPosition: p.position })),
        }),
      }).catch(() => {});
    }
  }, [phase, winner, isLocalActive, players]);
}
