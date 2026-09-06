'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { OnlineRoomState, ActiveTaunt, Player } from '@/lib/types';
import { soundEngine } from '@/lib/audio';
import { animateOnlineSteps } from '@/lib/online-engine/onlineSyncHelper';
import { apiRollDice, apiAnswerQuiz, apiSendTaunt, apiLeaveRoom } from '@/lib/online-engine/onlineApi';

interface UseOnlineGameProps {
  playMode: string; setPlayMode: (mode: 'LOCAL' | 'ONLINE' | 'SELECT') => void;
  players: Player[]; setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setActivePlayerIndex: (idx: number) => void; setDiceValue: (val: number) => void;
  setPhase: (phase: any) => void; setCurrentQuiz: (quiz: any) => void; setWinner: (winner: any) => void;
  setLogs: (logs: any) => void; setConsecutiveSixes: (val: number) => void; setLastRolledSix: (val: boolean) => void;
  setQuizTiles: (tiles: number[]) => void; isRolling: boolean; setIsRolling: (val: boolean) => void;
}

export function useOnlineGame({
  playMode, setPlayMode, players, setPlayers, setActivePlayerIndex,
  setDiceValue, setPhase, setCurrentQuiz, setWinner, setLogs,
  setConsecutiveSixes, setLastRolledSix, setQuizTiles, isRolling, setIsRolling,
}: UseOnlineGameProps) {
  const [onlineRoom, setOnlineRoom] = useState<OnlineRoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showOnlineLobby, setShowOnlineLobby] = useState<boolean>(false);
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');
  const [activeTaunt, setActiveTaunt] = useState<ActiveTaunt | null>(null);

  const lastOnlineVersionRef = useRef<number>(0);
  const tauntTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTauntTimestampRef = useRef<number>(0);
  const isOnlineAnimatingRef = useRef<boolean>(false);
  const playersRef = useRef<Player[]>(players);
  useEffect(() => { playersRef.current = players; }, [players]);

  const triggerTaunt = useCallback((taunt: ActiveTaunt) => {
    lastTauntTimestampRef.current = Math.max(lastTauntTimestampRef.current, taunt.timestamp);
    setActiveTaunt(taunt);
    if (tauntTimerRef.current) clearTimeout(tauntTimerRef.current);
    tauntTimerRef.current = setTimeout(() => setActiveTaunt(null), 3500);
  }, []);

  const applyRoomState = (s: OnlineRoomState) => {
    setOnlineRoom(s); setPlayers(s.players); setActivePlayerIndex(s.activePlayerIndex);
    setDiceValue(s.diceValue); setPhase(s.phase); setCurrentQuiz(s.currentQuiz);
    setWinner(s.winner); setLogs(s.logs); setConsecutiveSixes(s.consecutiveSixes);
    setLastRolledSix(s.lastRolledSix); if (s.quizTiles?.length) setQuizTiles(s.quizTiles);
  };

  // Polling sync online
  useEffect(() => {
    if (playMode !== 'ONLINE' || !onlineRoom || onlineRoom.status !== 'PLAYING') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${onlineRoom.code}/sync`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.state && data.state.version !== lastOnlineVersionRef.current) {
          if (isOnlineAnimatingRef.current) return;
          lastOnlineVersionRef.current = data.state.version;
          const s = data.state as OnlineRoomState;
          if (s.lastTaunt && s.lastTaunt.timestamp > lastTauntTimestampRef.current) {
            triggerTaunt(s.lastTaunt);
          }
          const curList = playersRef.current;
          const movedIdx = s.players.findIndex((p, idx) => curList[idx] && p.position !== curList[idx].position);
          if (movedIdx !== -1 && !isOnlineAnimatingRef.current && !isRolling) {
            isOnlineAnimatingRef.current = true;
            setIsRolling(true);
            soundEngine.playDiceRoll();
            await new Promise((r) => setTimeout(r, 500));
            setDiceValue(s.diceValue);
            setIsRolling(false);
            await new Promise((r) => setTimeout(r, 350));
            try {
              await animateOnlineSteps(movedIdx, curList[movedIdx].position, s.diceValue, s.players[movedIdx].position, setPlayers);
            } finally {
              isOnlineAnimatingRef.current = false;
            }
          }
          applyRoomState(s);
          if (s.logs?.[0]?.type === 'win') soundEngine.playVictory();
          else if (s.logs?.[0]?.type === 'quiz') soundEngine.playQuizTick();
        }
      } catch {}
    }, 1200);
    return () => clearInterval(interval);
  }, [playMode, onlineRoom?.code, onlineRoom?.status, triggerTaunt, isRolling]);

  const handleOnlineGameStarted = (room: OnlineRoomState, myId: number) => {
    applyRoomState(room); setMyPlayerId(myId); setShowOnlineLobby(false); setPlayMode('ONLINE');
    lastOnlineVersionRef.current = room.version;
    if (typeof window !== 'undefined') window.history.replaceState({}, '', `/?room=${room.code}`);
  };

  const handleLeaveOnlineRoom = async () => {
    if (!confirm('Yakin ingin keluar dari room online ini?')) return;
    if (onlineRoom && myPlayerId) {
      let hostId: string | undefined;
      try {
        const raw = localStorage.getItem(`ular_session_${onlineRoom.code}`);
        if (raw) hostId = JSON.parse(raw).hostId;
      } catch {}
      await apiLeaveRoom(onlineRoom.code, myPlayerId, hostId);
      localStorage.removeItem(`ular_session_${onlineRoom.code}`);
    }
    setOnlineRoom(null); setMyPlayerId(null); setPlayers([]); setPhase('SETUP'); setWinner(null); setLogs([]);
    setShowOnlineLobby(false); setPlayMode('SELECT');
    if (typeof window !== 'undefined') window.history.replaceState({}, '', '/');
  };

  const handleOnlineRollDice = async () => {
    if (!onlineRoom || !myPlayerId || isRolling || isOnlineAnimatingRef.current) return;
    setIsRolling(true);
    soundEngine.playDiceRoll();
    const rollInt = setInterval(() => setDiceValue(Math.floor(Math.random() * 6) + 1), 80);
    try {
      const d = await apiRollDice(onlineRoom.code, myPlayerId);
      await new Promise((r) => setTimeout(r, 600));
      clearInterval(rollInt);
      if (d?.success && d.state) {
        lastOnlineVersionRef.current = d.state.version;
        const s = d.state as OnlineRoomState;
        setDiceValue(s.diceValue);
        setIsRolling(false);
        await new Promise((r) => setTimeout(r, 350));
        isOnlineAnimatingRef.current = true;
        const myIdx = s.players.findIndex((p) => p.id === myPlayerId);
        try {
          if (myIdx !== -1 && playersRef.current[myIdx]) {
            await animateOnlineSteps(myIdx, playersRef.current[myIdx].position, s.diceValue, s.players[myIdx].position, setPlayers);
          }
        } finally {
          isOnlineAnimatingRef.current = false;
          applyRoomState(s);
        }
        if (s.phase === 'GAME_OVER') soundEngine.playVictory();
        else if (s.phase === 'QUIZ_ACTIVE') soundEngine.playQuizTick();
      } else {
        setIsRolling(false);
        fetch(`/api/rooms/${onlineRoom.code}/sync`).then((r) => (r.ok ? r.json() : null)).then((res) => {
          if (res?.state) applyRoomState(res.state);
        }).catch(() => {});
      }
    } catch {
      clearInterval(rollInt);
      setIsRolling(false);
    }
  };

  const handleOnlineQuizAnswer = async (isCorrect: boolean) => {
    if (!onlineRoom || !myPlayerId) return;
    try {
      const d = await apiAnswerQuiz(onlineRoom.code, myPlayerId, isCorrect);
      if (d?.success && d.state) {
        lastOnlineVersionRef.current = d.state.version;
        const s = d.state as OnlineRoomState;
        const myIdx = s.players.findIndex((p) => p.id === myPlayerId);
        try {
          isOnlineAnimatingRef.current = true;
          if (myIdx !== -1 && playersRef.current[myIdx]) {
            await animateOnlineSteps(myIdx, playersRef.current[myIdx].position, s.diceValue, s.players[myIdx].position, setPlayers);
          }
        } finally {
          isOnlineAnimatingRef.current = false;
          applyRoomState(s);
        }
        if (s.phase === 'QUIZ_ACTIVE') soundEngine.playQuizTick();
        else if (isCorrect) soundEngine.playLadder();
        else soundEngine.playSnake();
      }
    } catch {}
  };

  const handleSendTaunt = async (text: string) => {
    if (!onlineRoom || !myPlayerId) return;
    try {
      const d = await apiSendTaunt(onlineRoom.code, myPlayerId, text);
      if (d?.taunt) triggerTaunt(d.taunt);
    } catch {}
  };

  const handleCopyRoomLink = () => {
    if (!onlineRoom) return;
    navigator.clipboard.writeText(`${window.location.origin}/?room=${onlineRoom.code}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return {
    onlineRoom, myPlayerId, copiedLink, showOnlineLobby, setShowOnlineLobby,
    initialRoomCode, setInitialRoomCode, activeTaunt, triggerTaunt,
    handleOnlineGameStarted, handleLeaveOnlineRoom, handleOnlineRollDice,
    handleOnlineQuizAnswer, handleSendTaunt, handleCopyRoomLink,
  };
}
