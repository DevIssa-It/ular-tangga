'use client';

import React, { useState, useEffect } from 'react';
import Board from '@/components/Board/Board';
import Dice from '@/components/Game/Dice';
import TurnBanner from '@/components/Game/TurnBanner';
import PlayerSidebar from '@/components/Game/PlayerSidebar';
import GameLog from '@/components/Game/GameLog';
import GameHeader from '@/components/Game/GameHeader';
import QuickChatBar from '@/components/Game/QuickChatBar';
import QuizModal from '@/components/Modals/QuizModal';
import SetupModal from '@/components/Modals/SetupModal';
import WinnerModal from '@/components/Modals/WinnerModal';
import ModeSelectModal from '@/components/Modals/ModeSelectModal';
import OnlineLobbyModal from '@/components/Modals/OnlineLobbyModal';
import { PlayMode } from '@/lib/types';
import { DEFAULT_PLAYER_PRESETS } from '@/lib/board-config';
import { useLocalGame } from '@/lib/hooks/useLocalGame';
import { useOnlineGame } from '@/lib/hooks/useOnlineGame';
import { useTurnAnnouncer } from '@/lib/hooks/useTurnAnnouncer';

export default function GamePage() {
  const [playMode, setPlayMode] = useState<PlayMode | 'SELECT'>('SELECT');
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(true);

  // Hook Engine Game Lokal
  const local = useLocalGame(playMode === 'LOCAL');

  // Hook Engine Game Online
  const online = useOnlineGame({
    playMode, setPlayMode,
    players: local.players, setPlayers: local.setPlayers,
    setActivePlayerIndex: local.setActivePlayerIndex, setDiceValue: local.setDiceValue,
    setPhase: local.setPhase, setCurrentQuiz: local.setCurrentQuiz, setWinner: local.setWinner,
    setLogs: local.setLogs, setConsecutiveSixes: local.setConsecutiveSixes, setLastRolledSix: local.setLastRolledSix,
    setQuizTiles: local.setQuizTiles, isRolling: local.isRolling, setIsRolling: local.setIsRolling,
  });

  // Deteksi room URL pada inisialisasi
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const roomParam = new URLSearchParams(window.location.search).get('room');
    if (roomParam) {
      online.setInitialRoomCode(roomParam.trim().toUpperCase());
      setPlayMode('ONLINE');
      online.setShowOnlineLobby(true);
    } else if (local.isLoaded && local.players.length >= 2) {
      setPlayMode('LOCAL');
    }
  }, [local.isLoaded]);

  // Hook Suara Vokal Pengumuman Giliran (Web Speech API)
  useTurnAnnouncer({
    phase: local.phase, players: local.players, activePlayerIndex: local.activePlayerIndex,
    playMode, myPlayerId: online.myPlayerId, consecutiveSixes: local.consecutiveSixes,
  });

  const activePlayer = local.players[local.activePlayerIndex] || DEFAULT_PLAYER_PRESETS[0];
  const myPlayer = playMode === 'ONLINE' ? local.players.find((p) => p.id === online.myPlayerId) : null;
  const isMyTurn = playMode === 'LOCAL' || (playMode === 'ONLINE' && activePlayer?.id === online.myPlayerId);

  const handleRoll = () => (playMode === 'ONLINE' ? online.handleOnlineRollDice() : local.rollLocalDice());
  const handleQuizAnswer = (ok: boolean) => (playMode === 'ONLINE' ? online.handleOnlineQuizAnswer(ok) : local.answerLocalQuiz(ok));
  const handleSendTaunt = (txt: string) => {
    if (playMode === 'ONLINE') online.handleSendTaunt(txt);
    else {
      online.triggerTaunt({ playerId: activePlayer.id, senderName: activePlayer.name, text: txt, timestamp: Date.now() });
      local.addLog(`💬 ${activePlayer.name}: "${txt}"`, 'info');
    }
  };

  if (!local.isLoaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ fontWeight: 800 }}>Memuat Ular Tangga Trivia...</p></div>;

  return (
    <>
      <GameHeader
        playMode={playMode} onlineRoom={online.onlineRoom} myPlayer={myPlayer} copiedLink={online.copiedLink}
        onCopyRoomLink={online.handleCopyRoomLink} onLeaveOnlineRoom={online.handleLeaveOnlineRoom}
        onSwitchToOnline={() => { setPlayMode('ONLINE'); online.setShowOnlineLobby(true); }} onResetLocal={local.resetLocal}
      />

      <main className="main-layout">
        {/* Kolom Kiri: Daftar Pemain & Riwayat Permainan */}
        <aside className="layout-col-left">
          {local.players.length > 0 && <PlayerSidebar players={local.players} activePlayerIndex={local.activePlayerIndex} />}
          {local.players.length > 0 && <GameLog logs={local.logs} />}
        </aside>

        {/* Kolom Tengah: Papan Permainan Utama (Lega & Besar) */}
        <section className="layout-col-center">
          <div className="board-legend">
            <div className="legend-item"><div className="legend-swatch ladder" /><span>Tangga (Naik)</span></div>
            <div className="legend-item"><div className="legend-swatch snake" /><span>Ular (Turun)</span></div>
            <div className="legend-item"><div className="legend-swatch quiz" /><span>❓ Kuis (+2 / -1)</span></div>
          </div>

          <Board players={local.players} activePlayerIndex={local.activePlayerIndex} quizTiles={local.quizTiles} activeTaunt={online.activeTaunt} />
        </section>

        {/* Kolom Kanan: Giliran, Lempar Dadu, Chat & Ejekan */}
        <aside className="layout-col-right">
          {local.players.length > 0 && <TurnBanner player={activePlayer} phase={local.phase} hasBonusRoll={local.lastRolledSix && local.consecutiveSixes > 0 && local.phase === 'WAIT_ROLL'} />}
          {playMode === 'ONLINE' && !isMyTurn && (
            <div style={{ padding: '8px 12px', backgroundColor: '#FEF3C7', border: '2px solid #D97706', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700, color: '#92400E', textAlign: 'center', boxShadow: '2px 2px 0px #D97706' }}>
              ⏳ Menunggu giliran <strong>{activePlayer?.name}</strong> melempar dadu...
            </div>
          )}
          <Dice value={local.diceValue} isRolling={local.isRolling} disabled={local.phase !== 'WAIT_ROLL' || !isMyTurn} onRoll={handleRoll} activePlayerName={playMode === 'ONLINE' && isMyTurn ? 'Anda' : activePlayer.name} />
          
          {/* Chat & Ejekan Bidak Langsung */}
          {local.phase !== 'SETUP' && playMode !== 'SELECT' && (
            <QuickChatBar senderName={playMode === 'ONLINE' ? (myPlayer?.name || 'Saya') : activePlayer.name} onSendTaunt={handleSendTaunt} />
          )}
        </aside>
      </main>

      {playMode === 'SELECT' && (
        <ModeSelectModal
          hasActiveGame={local.players.length >= 2 && local.phase !== 'SETUP'}
          onClose={local.players.length >= 2 && local.phase !== 'SETUP' ? () => setPlayMode('LOCAL') : undefined}
          onSelectLocal={() => { setPlayMode('LOCAL'); if (local.players.length < 2 || local.phase === 'SETUP') local.setPhase('SETUP'); }}
          onSelectOnline={() => { setPlayMode('ONLINE'); online.setShowOnlineLobby(true); }}
        />
      )}

      {online.showOnlineLobby && (
        <OnlineLobbyModal
          initialRoomCode={online.initialRoomCode}
          hasActiveGame={local.players.length >= 2 && local.phase !== 'SETUP'}
          onGameStarted={online.handleOnlineGameStarted}
          onBackToModeSelect={() => {
            online.setShowOnlineLobby(false);
            setPlayMode('SELECT');
          }}
          onClose={() => {
            online.setShowOnlineLobby(false);
            if (local.players.length >= 2 && local.phase !== 'SETUP') {
              setPlayMode('LOCAL');
            } else {
              setPlayMode('SELECT');
            }
          }}
        />
      )}

      {playMode === 'LOCAL' && local.phase === 'SETUP' && (
        <SetupModal
          onStartGame={local.startLocalGame}
          onBackToModeSelect={() => setPlayMode('SELECT')}
          onClose={local.players.length >= 2 ? () => local.setPhase('WAIT_ROLL') : undefined}
        />
      )}

      {local.phase === 'QUIZ_ACTIVE' && local.currentQuiz && (
        <QuizModal question={local.currentQuiz} player={activePlayer} onAnswer={handleQuizAnswer} isSpectator={playMode === 'ONLINE' && activePlayer.id !== online.myPlayerId} />
      )}

      {local.phase === 'GAME_OVER' && local.winner && showWinnerModal && (
        <WinnerModal winner={local.winner} onRematch={local.rematchLocal} onNewGame={() => (playMode === 'ONLINE' ? online.handleLeaveOnlineRoom() : local.resetLocal())} onClose={() => setShowWinnerModal(false)} />
      )}
    </>
  );
}
