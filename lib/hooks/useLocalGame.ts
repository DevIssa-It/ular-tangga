'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Player, GamePhase, GameLogEntry, QuizQuestion } from '@/lib/types';
import { generateRandomQuizTiles, DEFAULT_QUIZ_TILES } from '@/lib/board-config';
import { soundEngine } from '@/lib/audio';
import { evaluateLandedTile, movePawnStepByStep, moveQuizSteps } from '@/lib/local-engine/evaluateMovement';
import { useLocalPersistence } from '@/lib/local-engine/localStorageSync';

export function useLocalGame(isLocalActive: boolean) {
  const [phase, setPhase] = useState<GamePhase>('SETUP');
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0); const [lastRolledSix, setLastRolledSix] = useState(false);
  const [quizTiles, setQuizTiles] = useState<number[]>(DEFAULT_QUIZ_TILES);
  const isAnsweringRef = useRef(false);

  // Restore dari localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('snakes_ladders_save_v1');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.players?.length >= 2) {
          setPlayers(d.players);
          setActivePlayerIndex(d.activePlayerIndex || 0);
          setDiceValue(d.diceValue || 1);
          setLogs(d.logs || []);
          setWinner(d.winner || null);
          setPhase(d.winner ? 'GAME_OVER' : 'WAIT_ROLL');
          setQuizTiles(Array.isArray(d.quizTiles) ? d.quizTiles : generateRandomQuizTiles());
        }
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  useLocalPersistence({ isLoaded, isLocalActive, phase, players, activePlayerIndex, diceValue, logs, winner, quizTiles });

  const addLog = useCallback((text: string, type: GameLogEntry['type'] = 'info') => {
    setLogs((prev) => [{ id: `log-${Date.now()}-${Math.random()}`, text, type, timestamp: new Date() }, ...prev]);
  }, []);

  const nextTurn = useCallback(() => {
    setConsecutiveSixes(0);
    setLastRolledSix(false);
    setActivePlayerIndex((prev) => (prev + 1) % players.length);
    setPhase('WAIT_ROLL');
  }, [players.length]);

  const finishTurn = useCallback((wasSix: boolean) => {
    if (wasSix) setPhase('WAIT_ROLL');
    else nextTurn();
  }, [nextTurn]);

  const handleTileEvent = async (tile: number, pIdx: number, wasSix: boolean) => {
    const res = await evaluateLandedTile(tile, players[pIdx], quizTiles);
    if (res.logText) addLog(res.logText, res.specialType);
    if (res.specialType === 'quiz') {
      if (res.quiz) setCurrentQuiz(res.quiz);
      setPhase('QUIZ_ACTIVE');
      return;
    }
    if (res.specialType === 'ladder' || res.specialType === 'snake') {
      setPhase('ON_SPECIAL');
      await new Promise((r) => setTimeout(r, 400));
      setPlayers((prev) => {
        const u = [...prev];
        u[pIdx].position = res.nextPos;
        if (res.specialType === 'ladder') u[pIdx].laddersClimbed += 1;
        if (res.specialType === 'snake') u[pIdx].snakesBitten += 1;
        return u;
      });
      await new Promise((r) => setTimeout(r, 500));
      if (quizTiles.includes(res.nextPos)) {
        const nextRes = await evaluateLandedTile(res.nextPos, players[pIdx], quizTiles);
        if (nextRes.quiz) setCurrentQuiz(nextRes.quiz);
        setPhase('QUIZ_ACTIVE');
        return;
      }
    }
    if (res.isWin) {
      soundEngine.playVictory();
      setWinner(players[pIdx]);
      setPhase('GAME_OVER');
      return;
    }
    finishTurn(wasSix);
  };

  const rollLocalDice = async () => {
    if (phase !== 'WAIT_ROLL' || isRolling) return;
    setIsRolling(true);
    setPhase('ROLLING');
    soundEngine.playDiceRoll();
    const interval = setInterval(() => setDiceValue(Math.floor(Math.random() * 6) + 1), 80);
    await new Promise((r) => setTimeout(r, 600));
    clearInterval(interval);

    const finalDice = Math.floor(Math.random() * 6) + 1;
    setDiceValue(finalDice);
    setIsRolling(false);
    await new Promise((r) => setTimeout(r, 350));
    setPhase('MOVING');

    const cur = players[activePlayerIndex];
    addLog(`${cur.name} melempar dadu: ${finalDice} 🎲`, 'info');
    const isSix = finalDice === 6;
    const nextSixes = isSix ? consecutiveSixes + 1 : 0;
    if (isSix && nextSixes >= 3) {
      setConsecutiveSixes(0); setLastRolledSix(false);
      addLog(`⚠️ ${cur.name} dapat 6 tiga kali berurutan! Lemparan batal.`, 'info');
      nextTurn();
      return;
    }

    setConsecutiveSixes(nextSixes);
    setLastRolledSix(isSix);
    if (isSix) addLog(`🎉 Angka 6! ${cur.name} lempar lagi!`, 'info');
    setPlayers((prev) => {
      const u = [...prev];
      u[activePlayerIndex].turnsTaken += 1;
      return u;
    });

    const startPos = cur?.position || 1;
    const landed = await movePawnStepByStep(finalDice, activePlayerIndex, startPos, setPlayers);
    if (landed === 100) {
      soundEngine.playVictory();
      setWinner(cur);
      setPhase('GAME_OVER');
      addLog(`🏆 ${cur.name} MENANG! Mencapai Petak 100!`, 'win');
      return;
    }
    await handleTileEvent(landed, activePlayerIndex, isSix);
  };

  const answerLocalQuiz = async (isCorrect: boolean) => {
    if (isAnsweringRef.current) return;
    isAnsweringRef.current = true;
    try {
      const pIdx = activePlayerIndex;
      const player = players[pIdx];
      setPlayers((prev) => {
        const u = [...prev];
        u[pIdx].quizzesAnswered += 1;
        if (isCorrect) u[pIdx].quizzesCorrect += 1;
        return u;
      });
      setCurrentQuiz(null);
      setPhase('MOVING');
      addLog(isCorrect ? `✅ ${player.name} benar! Maju +2!` : `❌ ${player.name} salah! Mundur -1!`, 'quiz');
      const targetPos = await moveQuizSteps(pIdx, player.position, isCorrect, setPlayers);
      if (targetPos === 100) {
        soundEngine.playVictory();
        setWinner(player);
        setPhase('GAME_OVER');
        return;
      }
      await handleTileEvent(targetPos, pIdx, lastRolledSix);
    } finally {
      isAnsweringRef.current = false;
    }
  };

  const startLocalGame = (cfg: Player[]) => {
    setQuizTiles(generateRandomQuizTiles());
    setPlayers(cfg);
    setActivePlayerIndex(0);
    setWinner(null); setLogs([]); setConsecutiveSixes(0); setLastRolledSix(false); setPhase('WAIT_ROLL');
    addLog(`Permainan Lokal dimulai (${cfg.length} pemain)! 🎉`, 'info');
  };
  const rematchLocal = () => {
    setPlayers((p) => p.map((x) => ({ ...x, position: 1, previousPosition: 1, turnsTaken: 0, quizzesAnswered: 0, quizzesCorrect: 0, laddersClimbed: 0, snakesBitten: 0 })));
    setActivePlayerIndex(0);
    setWinner(null); setLogs([]); setConsecutiveSixes(0); setLastRolledSix(false);
    setQuizTiles(generateRandomQuizTiles()); setPhase('WAIT_ROLL');
    addLog('Pertandingan ulang dimulai! Siapa pemenangnya? 🔥', 'info');
  };
  const resetLocal = () => {
    try { localStorage.removeItem('snakes_ladders_save_v1'); } catch {}
    setPhase('SETUP');
  };

  return {
    phase, setPhase, players, setPlayers, activePlayerIndex, setActivePlayerIndex,
    diceValue, setDiceValue, isRolling, setIsRolling, currentQuiz, setCurrentQuiz,
    winner, setWinner, logs, setLogs, isLoaded,
    consecutiveSixes, setConsecutiveSixes, lastRolledSix, setLastRolledSix, quizTiles, setQuizTiles,
    addLog, startLocalGame, rollLocalDice, answerLocalQuiz, rematchLocal, resetLocal,
  };
}
