'use client';

import { useEffect, useRef } from 'react';
import { Player, GamePhase, PlayMode } from '@/lib/types';
import { soundEngine } from '@/lib/audio';

interface UseTurnAnnouncerProps {
  phase: GamePhase;
  players: Player[];
  activePlayerIndex: number;
  playMode: PlayMode | 'SELECT';
  myPlayerId: number | null;
  consecutiveSixes: number;
}

export function useTurnAnnouncer({
  phase,
  players,
  activePlayerIndex,
  playMode,
  myPlayerId,
  consecutiveSixes,
}: UseTurnAnnouncerProps) {
  const lastTurnKeyRef = useRef<string>('');

  useEffect(() => {
    if (phase !== 'WAIT_ROLL' || players.length === 0) return;
    const currentP = players[activePlayerIndex];
    if (!currentP) return;

    const turnKey = `${playMode}-${currentP.id}-${currentP.turnsTaken}-${consecutiveSixes}`;
    if (lastTurnKeyRef.current === turnKey) return;
    lastTurnKeyRef.current = turnKey;

    const isMe = playMode === 'ONLINE' && myPlayerId !== null && currentP.id === myPlayerId;
    soundEngine.playTurnVoice(currentP.name, isMe);
  }, [activePlayerIndex, phase, playMode, players, myPlayerId, consecutiveSixes]);
}
