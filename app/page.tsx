'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Board from '@/components/Board/Board';
import Dice from '@/components/Game/Dice';
import TurnBanner from '@/components/Game/TurnBanner';
import PlayerSidebar from '@/components/Game/PlayerSidebar';
import GameLog from '@/components/Game/GameLog';
import QuizModal from '@/components/Modals/QuizModal';
import SetupModal from '@/components/Modals/SetupModal';
import WinnerModal from '@/components/Modals/WinnerModal';
import ModeSelectModal from '@/components/Modals/ModeSelectModal';
import OnlineLobbyModal from '@/components/Modals/OnlineLobbyModal';
import GameHeader from '@/components/Game/GameHeader';
import {
  Player,
  GamePhase,
  GameLogEntry,
  QuizQuestion,
  PlayMode,
  OnlineRoomState,
} from '@/lib/types';
import {
  LADDERS,
  SNAKES,
  DEFAULT_PLAYER_PRESETS,
  generateRandomQuizTiles,
  DEFAULT_QUIZ_TILES,
} from '@/lib/board-config';
import { getRandomQuiz } from '@/lib/quiz-bank';
import { soundEngine } from '@/lib/audio';

export default function GamePage() {
  // Mode Permainan: SELECT, LOCAL, ONLINE
  const [playMode, setPlayMode] = useState<PlayMode | 'SELECT'>('SELECT');
  const [showOnlineLobby, setShowOnlineLobby] = useState<boolean>(false);
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');
  const [onlineRoom, setOnlineRoom] = useState<OnlineRoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const lastOnlineVersionRef = useRef<number>(0);
  const isAnsweringQuizRef = useRef<boolean>(false);

  // Game Engine State
  const [phase, setPhase] = useState<GamePhase>('SETUP');
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(true);
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [lastRolledSix, setLastRolledSix] = useState<boolean>(false);
  const [quizTiles, setQuizTiles] = useState<number[]>(DEFAULT_QUIZ_TILES);

  // 1. Inisialisasi: Cek parameter URL `?room=CODE` atau sesi tersimpan
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const roomParam = searchParams.get('room');
      if (roomParam) {
        setInitialRoomCode(roomParam.trim().toUpperCase());
        setPlayMode('ONLINE');
        setShowOnlineLobby(true);
        setIsLoaded(true);
        return;
      }
    }

    try {
      const saved = localStorage.getItem('snakes_ladders_save_v1');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.players && data.players.length >= 2) {
          setPlayers(data.players);
          setActivePlayerIndex(data.activePlayerIndex || 0);
          setDiceValue(data.diceValue || 1);
          setLogs(data.logs || []);
          setWinner(data.winner || null);
          setPhase(data.winner ? 'GAME_OVER' : 'WAIT_ROLL');
          setQuizTiles(
            data.quizTiles && Array.isArray(data.quizTiles)
              ? data.quizTiles
              : generateRandomQuizTiles()
          );
          setPlayMode('LOCAL');
          setIsLoaded(true);
          return;
        }
      }
    } catch {
      // Abaikan error localStorage
    }

    setPlayMode('SELECT');
    setIsLoaded(true);
  }, []);

  // 2. Simpan otomatis untuk Mode Lokal ke localStorage
  useEffect(() => {
    if (!isLoaded || playMode !== 'LOCAL' || players.length === 0) return;
    try {
      const stateToSave = {
        players,
        activePlayerIndex,
        diceValue,
        logs: logs.slice(0, 30),
        winner,
        quizTiles,
        savedAt: Date.now(),
      };
      localStorage.setItem('snakes_ladders_save_v1', JSON.stringify(stateToSave));
    } catch {
      // Abaikan error penyimpanan
    }
  }, [players, activePlayerIndex, diceValue, logs, winner, isLoaded, playMode]);

  // 3. Realtime Polling untuk Mode Online
  useEffect(() => {
    if (playMode !== 'ONLINE' || !onlineRoom || onlineRoom.status !== 'PLAYING') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${onlineRoom.code}/sync`);
        if (res.ok) {
          const data = await res.json();
          if (data.state && data.state.version !== lastOnlineVersionRef.current) {
            lastOnlineVersionRef.current = data.state.version;
            const s = data.state as OnlineRoomState;
            setOnlineRoom(s);
            setPlayers(s.players);
            setActivePlayerIndex(s.activePlayerIndex);
            setDiceValue(s.diceValue);
            setPhase(s.phase);
            setCurrentQuiz(s.currentQuiz);
            setWinner(s.winner);
            setLogs(s.logs);
            setConsecutiveSixes(s.consecutiveSixes);
            setLastRolledSix(s.lastRolledSix);
            if (s.quizTiles && s.quizTiles.length > 0) {
              setQuizTiles(s.quizTiles);
            }

            if (s.logs && s.logs.length > 0) {
              const latest = s.logs[0];
              if (latest.type === 'ladder') soundEngine.playLadder();
              else if (latest.type === 'snake') soundEngine.playSnake();
              else if (latest.type === 'win') soundEngine.playVictory();
              else if (latest.type === 'quiz') soundEngine.playQuizTick();
            }
          }
        }
      } catch {
        // Abaikan transient network error
      }
    }, 1200);

    return () => clearInterval(pollInterval);
  }, [playMode, onlineRoom?.code, onlineRoom?.status]);

  // Utility penambahan riwayat (Log)
  const addLog = useCallback(
    (text: string, type: GameLogEntry['type'] = 'info') => {
      setLogs((prev) => [
        {
          id: `log-${Date.now()}-${Math.random()}`,
          text,
          type,
          timestamp: new Date(),
        },
        ...prev,
      ]);
    },
    []
  );

  // Mulai Permainan Mode Lokal
  const handleStartLocalGame = (configuredPlayers: Player[]) => {
    const randomizedTiles = generateRandomQuizTiles();
    setQuizTiles(randomizedTiles);
    setPlayers(configuredPlayers);
    setActivePlayerIndex(0);
    setPhase('WAIT_ROLL');
    setWinner(null);
    setLogs([]);
    setConsecutiveSixes(0);
    setLastRolledSix(false);
    addLog(
      `Permainan Lokal dimulai (${configuredPlayers.length} pemain)! Letak kuis diacak secara dinamis. 🎉`,
      'info'
    );
  };

  // Callback saat game online dimulai dari OnlineLobbyModal
  const handleOnlineGameStarted = (room: OnlineRoomState, myId: number) => {
    setOnlineRoom(room);
    setMyPlayerId(myId);
    setPlayers(room.players);
    setActivePlayerIndex(room.activePlayerIndex);
    setDiceValue(room.diceValue);
    setPhase(room.phase);
    setCurrentQuiz(room.currentQuiz);
    setWinner(room.winner);
    setLogs(room.logs);
    setConsecutiveSixes(room.consecutiveSixes);
    setLastRolledSix(room.lastRolledSix);
    if (room.quizTiles && room.quizTiles.length > 0) {
      setQuizTiles(room.quizTiles);
    }
    setShowOnlineLobby(false);
    setPlayMode('ONLINE');
    lastOnlineVersionRef.current = room.version;

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `/?room=${room.code}`);
    }
  };

  // Reset Permainan Lokal
  const handleResetLocal = () => {
    try {
      localStorage.removeItem('snakes_ladders_save_v1');
    } catch {}
    setPhase('SETUP');
  };

  // Keluar dari Room Online
  const handleLeaveOnlineRoom = () => {
    setOnlineRoom(null);
    setMyPlayerId(null);
    setShowOnlineLobby(false);
    setPlayMode('SELECT');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/');
    }
  };

  // Salin Link Room Online
  const handleCopyRoomLink = () => {
    if (!onlineRoom) return;
    const url = `${window.location.origin}/?room=${onlineRoom.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Pindah giliran pemain (Mode Lokal)
  const nextTurn = useCallback(() => {
    setConsecutiveSixes(0);
    setLastRolledSix(false);
    setActivePlayerIndex((prev) => (prev + 1) % players.length);
    setPhase('WAIT_ROLL');
  }, [players.length]);

  // Selesaikan giliran atau bonus 6 (Mode Lokal)
  const finishTurn = useCallback(
    (wasSix: boolean) => {
      if (wasSix) {
        setPhase('WAIT_ROLL');
      } else {
        setConsecutiveSixes(0);
        setLastRolledSix(false);
        nextTurn();
      }
    },
    [nextTurn]
  );

  // Animasi langkah pion sekuensial (Mode Lokal)
  const movePawnStepByStep = async (
    steps: number,
    playerIdx: number
  ): Promise<number> => {
    let currentPos = players[playerIdx].position;
    let forward = true;

    for (let i = 0; i < steps; i++) {
      if (currentPos >= 100) {
        forward = false;
      }

      currentPos = forward ? currentPos + 1 : currentPos - 1;
      soundEngine.playStep();

      setPlayers((prev) => {
        const updated = [...prev];
        updated[playerIdx] = {
          ...updated[playerIdx],
          position: currentPos,
        };
        return updated;
      });

      await new Promise((resolve) => setTimeout(resolve, 260));
    }

    return currentPos;
  };

  // Evaluasi peristiwa petak (Mode Lokal)
  const evaluateTile = async (
    tile: number,
    playerIdx: number,
    wasSix: boolean
  ) => {
    const player = players[playerIdx];

    // 1. Tangga
    const ladder = LADDERS.find((l) => l.start === tile);
    if (ladder) {
      setPhase('ON_SPECIAL');
      soundEngine.playLadder();
      addLog(
        `🪜 Hore! ${player.name} naik tangga dari petak ${ladder.start} ke ${ladder.end}!`,
        'ladder'
      );

      await new Promise((resolve) => setTimeout(resolve, 400));

      setPlayers((prev) => {
        const updated = [...prev];
        updated[playerIdx].position = ladder.end;
        updated[playerIdx].laddersClimbed += 1;
        return updated;
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (ladder.end === 100) {
        soundEngine.playVictory();
        setWinner(players[playerIdx]);
        setPhase('GAME_OVER');
        return;
      }

      finishTurn(wasSix);
      return;
    }

    // 2. Ular
    const snake = SNAKES.find((s) => s.start === tile);
    if (snake) {
      setPhase('ON_SPECIAL');
      soundEngine.playSnake();
      addLog(
        `🐍 Ups! ${player.name} digigit ular di ${snake.start} -> meluncur ke ${snake.end}!`,
        'snake'
      );

      await new Promise((resolve) => setTimeout(resolve, 400));

      setPlayers((prev) => {
        const updated = [...prev];
        updated[playerIdx].position = snake.end;
        updated[playerIdx].snakesBitten += 1;
        return updated;
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
      finishTurn(wasSix);
      return;
    }

    // 3. Kuis Dinamis
    const isQuizTile = quizTiles.includes(tile);
    if (isQuizTile) {
      const quiz = getRandomQuiz();
      setCurrentQuiz(quiz);
      setPhase('QUIZ_ACTIVE');
      addLog(
        `❓ ${player.name} di petak Kuis ${tile}! Kategori: ${quiz.category}`,
        'quiz'
      );
      return;
    }

    finishTurn(wasSix);
  };

  // Lempar Dadu Utama (Lokal & Online)
  const handleRollDice = async () => {
    if (phase !== 'WAIT_ROLL' || isRolling) return;

    // A. ONLINE MODE
    if (playMode === 'ONLINE') {
      if (!onlineRoom || !myPlayerId) return;
      const currentActive = players[activePlayerIndex];
      if (!currentActive || currentActive.id !== myPlayerId) return;

      setIsRolling(true);
      soundEngine.playDiceRoll();

      const rollInterval = setInterval(() => {
        setDiceValue(Math.floor(Math.random() * 6) + 1);
      }, 80);

      try {
        const res = await fetch(`/api/rooms/${onlineRoom.code}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ROLL_DICE', playerId: myPlayerId }),
        });

        await new Promise((resolve) => setTimeout(resolve, 500));
        clearInterval(rollInterval);
        setIsRolling(false);

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.state) {
            lastOnlineVersionRef.current = data.state.version;
            const s = data.state as OnlineRoomState;
            setOnlineRoom(s);
            setPlayers(s.players);
            setActivePlayerIndex(s.activePlayerIndex);
            setDiceValue(s.diceValue);
            setPhase(s.phase);
            setCurrentQuiz(s.currentQuiz);
            setWinner(s.winner);
            setLogs(s.logs);
            setConsecutiveSixes(s.consecutiveSixes);
            setLastRolledSix(s.lastRolledSix);

            if (s.phase === 'GAME_OVER') soundEngine.playVictory();
            else if (s.phase === 'QUIZ_ACTIVE') soundEngine.playQuizTick();
            else soundEngine.playStep();
          }
        }
      } catch {
        clearInterval(rollInterval);
        setIsRolling(false);
      }
      return;
    }

    // B. LOKAL MODE
    setIsRolling(true);
    setPhase('ROLLING');
    soundEngine.playDiceRoll();

    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 80);

    await new Promise((resolve) => setTimeout(resolve, 600));
    clearInterval(interval);

    const finalDice = Math.floor(Math.random() * 6) + 1;
    setDiceValue(finalDice);
    setIsRolling(false);
    setPhase('MOVING');

    const currentPlayer = players[activePlayerIndex];
    addLog(`${currentPlayer.name} melempar dadu: ${finalDice} 🎲`, 'info');

    const isSix = finalDice === 6;
    const nextSixes = isSix ? consecutiveSixes + 1 : 0;

    if (isSix && nextSixes >= 3) {
      setConsecutiveSixes(0);
      setLastRolledSix(false);
      addLog(
        `⚠️ ${currentPlayer.name} dapat 6 tiga kali berturut-turut! Lemparan batal.`,
        'info'
      );
      nextTurn();
      return;
    }

    setConsecutiveSixes(nextSixes);
    setLastRolledSix(isSix);

    if (isSix) {
      addLog(
        `🎉 Angka 6! ${currentPlayer.name} berhak melempar dadu sekali lagi!`,
        'info'
      );
    }

    setPlayers((prev) => {
      const updated = [...prev];
      updated[activePlayerIndex].turnsTaken += 1;
      return updated;
    });

    const landedTile = await movePawnStepByStep(finalDice, activePlayerIndex);

    if (landedTile === 100) {
      soundEngine.playVictory();
      setWinner(players[activePlayerIndex]);
      setPhase('GAME_OVER');
      addLog(`🏆 ${currentPlayer.name} MENANG! Mencapai Petak 100!`, 'win');
      return;
    }

    await evaluateTile(landedTile, activePlayerIndex, isSix);
  };

  // Evaluasi Jawaban Kuis (Lokal & Online)
  const handleQuizAnswer = async (isCorrect: boolean) => {
    if (isAnsweringQuizRef.current) return;
    isAnsweringQuizRef.current = true;

    try {
      // A. ONLINE MODE
      if (playMode === 'ONLINE') {
        if (!onlineRoom || !myPlayerId) return;
        try {
          const res = await fetch(`/api/rooms/${onlineRoom.code}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'ANSWER_QUIZ',
              playerId: myPlayerId,
              isCorrect,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.state) {
              lastOnlineVersionRef.current = data.state.version;
              const s = data.state as OnlineRoomState;
              setOnlineRoom(s);
              setPlayers(s.players);
              setActivePlayerIndex(s.activePlayerIndex);
              setPhase(s.phase);
              setCurrentQuiz(s.currentQuiz);
              setWinner(s.winner);
              setLogs(s.logs);
              setConsecutiveSixes(s.consecutiveSixes);
              setLastRolledSix(s.lastRolledSix);

              if (isCorrect) soundEngine.playLadder();
              else soundEngine.playSnake();
            }
          }
        } catch {
          // ignore
        }
        return;
      }

      // B. LOKAL MODE
      const playerIdx = activePlayerIndex;
      const player = players[playerIdx];
      const startPos = player.position;

      setPlayers((prev) => {
        const updated = [...prev];
        updated[playerIdx].quizzesAnswered += 1;
        if (isCorrect) {
          updated[playerIdx].quizzesCorrect += 1;
        }
        return updated;
      });

      setCurrentQuiz(null);
      setPhase('MOVING');

      if (isCorrect) {
        addLog(
          `✅ ${player.name} menjawab kuis dengan benar! Bonus maju +2 petak!`,
          'quiz'
        );
        let newPos = startPos + 2;
        if (newPos > 100) newPos = 100 - (newPos - 100);

        for (let i = 1; i <= 2; i++) {
          soundEngine.playStep();
          const target = Math.min(100, startPos + i);
          setPlayers((prev) => {
            const updated = [...prev];
            updated[playerIdx] = {
              ...updated[playerIdx],
              position: target,
            };
            return updated;
          });
          await new Promise((resolve) => setTimeout(resolve, 250));
        }

        if (newPos === 100) {
          soundEngine.playVictory();
          setWinner(players[playerIdx]);
          setPhase('GAME_OVER');
          return;
        }

        const bonusLadder = LADDERS.find((l) => l.start === newPos);
        if (bonusLadder) {
          soundEngine.playLadder();
          addLog(
            `🪜 Hebat! Bonus membawa ${player.name} ke tangga ${bonusLadder.start} -> ${bonusLadder.end}!`,
            'ladder'
          );
          await new Promise((resolve) => setTimeout(resolve, 350));
          setPlayers((prev) => {
            const updated = [...prev];
            updated[playerIdx].position = bonusLadder.end;
            updated[playerIdx].laddersClimbed += 1;
            return updated;
          });
          await new Promise((resolve) => setTimeout(resolve, 400));
          if (bonusLadder.end === 100) {
            soundEngine.playVictory();
            setWinner(players[playerIdx]);
            setPhase('GAME_OVER');
            return;
          }
        }
      } else {
        addLog(
          `❌ ${player.name} belum tepat menjawab kuis! Penalti mundur -1 petak!`,
          'quiz'
        );
        const penaltyPos = Math.max(1, startPos - 1);
        if (startPos > 1) {
          soundEngine.playStep();
          setPlayers((prev) => {
            const updated = [...prev];
            updated[playerIdx] = {
              ...updated[playerIdx],
              position: penaltyPos,
            };
            return updated;
          });
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        const penaltySnake = SNAKES.find((s) => s.start === penaltyPos);
        if (penaltySnake) {
          soundEngine.playSnake();
          addLog(
            `🐍 Penalti menjatuhkan ${player.name} ke ular ${penaltySnake.start} -> ${penaltySnake.end}!`,
            'snake'
          );
          await new Promise((resolve) => setTimeout(resolve, 350));
          setPlayers((prev) => {
            const updated = [...prev];
            updated[playerIdx].position = penaltySnake.end;
            updated[playerIdx].snakesBitten += 1;
            return updated;
          });
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      finishTurn(lastRolledSix);
    } finally {
      isAnsweringQuizRef.current = false;
    }
  };

  // Main lagi (Rematch)
  const handleRematch = async () => {
    if (playMode === 'ONLINE') {
      if (!onlineRoom || !myPlayerId) return;
      try {
        const res = await fetch(`/api/rooms/${onlineRoom.code}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'REMATCH', playerId: myPlayerId }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.state) {
            lastOnlineVersionRef.current = data.state.version;
            const s = data.state as OnlineRoomState;
            setOnlineRoom(s);
            setPlayers(s.players);
            setActivePlayerIndex(s.activePlayerIndex);
            setPhase(s.phase);
            setCurrentQuiz(s.currentQuiz);
            setWinner(s.winner);
            setLogs(s.logs);
            setConsecutiveSixes(s.consecutiveSixes);
            setLastRolledSix(s.lastRolledSix);
          }
        }
      } catch {
        // ignore
      }
      return;
    }

    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        position: 1,
        previousPosition: 1,
        turnsTaken: 0,
        quizzesAnswered: 0,
        quizzesCorrect: 0,
        laddersClimbed: 0,
        snakesBitten: 0,
      }))
    );
    setActivePlayerIndex(0);
    setPhase('WAIT_ROLL');
    setWinner(null);
    setLogs([]);
    setConsecutiveSixes(0);
    setLastRolledSix(false);
    const refreshedTiles = generateRandomQuizTiles();
    setQuizTiles(refreshedTiles);
    addLog('Pertandingan ulang dimulai! Petak kuis baru diacak! Siapa pemenangnya? 🔥', 'info');
  };

  const activePlayer = players[activePlayerIndex] || DEFAULT_PLAYER_PRESETS[0];
  const myPlayer =
    playMode === 'ONLINE' ? players.find((p) => p.id === myPlayerId) : null;
  const isMyTurn =
    playMode === 'LOCAL' ||
    (playMode === 'ONLINE' && activePlayer?.id === myPlayerId);

  // Menutup Modal Lobby Online & Kembali ke Permainan yang Sedang Berjalan
  const handleCloseOnlineLobby = () => {
    setShowOnlineLobby(false);
    if (players.length > 0 && phase !== 'SETUP') {
      setPlayMode('LOCAL');
    } else {
      setPlayMode('SELECT');
    }
  };

  const diceButtonName =
    playMode === 'ONLINE'
      ? isMyTurn
        ? 'Anda'
        : activePlayer?.name
      : activePlayer?.name;

  if (!isLoaded) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ fontWeight: 800, color: 'var(--color-ink)' }}>
          Memuat Ular Tangga Trivia...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header Aplikasi Solid Flat */}
      <GameHeader
        playMode={playMode}
        onlineRoom={onlineRoom}
        myPlayer={myPlayer}
        copiedLink={copiedLink}
        onCopyRoomLink={handleCopyRoomLink}
        onLeaveOnlineRoom={handleLeaveOnlineRoom}
        onSwitchToOnline={() => {
          setShowOnlineLobby(true);
        }}
        onResetLocal={handleResetLocal}
      />

      {/* Konten Utama */}
      <main className="main-layout">
        {/* Kolom Papan Permainan */}
        <section className="board-section">
          {/* Legenda Papan */}
          <div className="board-legend">
            <div className="legend-item">
              <div className="legend-swatch ladder" />
              <span>Tangga (Naik)</span>
            </div>
            <div className="legend-item">
              <div className="legend-swatch snake" />
              <span>Ular (Turun)</span>
            </div>
            <div className="legend-item">
              <div className="legend-swatch quiz" />
              <span>❓ Kuis (+2 / -1)</span>
            </div>
          </div>

          {/* Komponen Papan 10x10 dengan Petak Kuis Dinamis */}
          <Board
            players={players}
            activePlayerIndex={activePlayerIndex}
            quizTiles={quizTiles}
          />
        </section>

        {/* Kolom Sidebar Kontrol & Info Pemain */}
        <aside className="sidebar-section">
          {players.length > 0 && (
            <TurnBanner
              player={activePlayer}
              phase={phase}
              hasBonusRoll={
                lastRolledSix && consecutiveSixes > 0 && phase === 'WAIT_ROLL'
              }
            />
          )}

          {/* Peringatan Giliran di Mode Online */}
          {playMode === 'ONLINE' && !isMyTurn && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#FEF3C7',
                border: '2px solid #D97706',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                color: '#92400E',
                textAlign: 'center',
                boxShadow: '2px 2px 0px #D97706',
              }}
            >
              ⏳ Menunggu giliran <strong>{activePlayer?.name}</strong> melempar dadu...
            </div>
          )}

          {/* Kontrol Dadu */}
          <Dice
            value={diceValue}
            isRolling={isRolling}
            disabled={phase !== 'WAIT_ROLL' || !isMyTurn}
            onRoll={handleRollDice}
            activePlayerName={diceButtonName}
          />

          {/* Daftar Pemain & Posisi */}
          {players.length > 0 && (
            <PlayerSidebar
              players={players}
              activePlayerIndex={activePlayerIndex}
            />
          )}

          {/* Riwayat Permainan */}
          <GameLog logs={logs} />
        </aside>
      </main>

      {/* Modal 1: Pemilihan Mode (Lokal vs Online) */}
      {playMode === 'SELECT' && (
        <ModeSelectModal
          hasActiveGame={players.length > 0 && phase !== 'SETUP'}
          onClose={
            players.length > 0 && phase !== 'SETUP'
              ? () => setPlayMode('LOCAL')
              : undefined
          }
          onSelectLocal={() => {
            setPlayMode('LOCAL');
            if (players.length === 0) {
              setPhase('SETUP');
            }
          }}
          onSelectOnline={() => {
            setPlayMode('ONLINE');
            setShowOnlineLobby(true);
          }}
        />
      )}

      {/* Modal 2: Lobby Online Room (Host / Join Room Neon DB) */}
      {showOnlineLobby && (
        <OnlineLobbyModal
          initialRoomCode={initialRoomCode}
          hasActiveGame={players.length > 0 && phase !== 'SETUP'}
          onGameStarted={handleOnlineGameStarted}
          onBackToModeSelect={handleCloseOnlineLobby}
          onClose={handleCloseOnlineLobby}
        />
      )}

      {/* Modal 3: Setup Pemain Lokal (Pass-and-Play) */}
      {playMode === 'LOCAL' && phase === 'SETUP' && (
        <SetupModal
          onStartGame={handleStartLocalGame}
          onClose={players.length > 0 ? () => setPhase('WAIT_ROLL') : undefined}
        />
      )}

      {/* Modal 4: Kuis Interaktif */}
      {phase === 'QUIZ_ACTIVE' && currentQuiz && (
        <QuizModal
          question={currentQuiz}
          player={activePlayer}
          onAnswer={handleQuizAnswer}
          isSpectator={playMode === 'ONLINE' && activePlayer.id !== myPlayerId}
        />
      )}

      {/* Modal 5: Kemenangan */}
      {phase === 'GAME_OVER' && winner && showWinnerModal && (
        <WinnerModal
          winner={winner}
          onRematch={handleRematch}
          onNewGame={() => {
            if (playMode === 'ONLINE') {
              handleLeaveOnlineRoom();
            } else {
              handleResetLocal();
            }
          }}
          onClose={() => setShowWinnerModal(false)}
        />
      )}
    </>
  );
}
