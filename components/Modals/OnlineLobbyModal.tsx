'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OnlineRoomState } from '@/lib/types';
import ChoiceView from './OnlineLobby/ChoiceView';
import CreateRoomView from './OnlineLobby/CreateRoomView';
import JoinRoomView from './OnlineLobby/JoinRoomView';
import WaitingLobbyView from './OnlineLobby/WaitingLobbyView';

interface OnlineLobbyModalProps {
  initialRoomCode?: string;
  hasActiveGame?: boolean;
  onGameStarted: (room: OnlineRoomState, myPlayerId: number) => void;
  onBackToModeSelect: () => void;
  onClose?: () => void;
}

export default function OnlineLobbyModal({
  initialRoomCode = '',
  hasActiveGame = false,
  onGameStarted,
  onBackToModeSelect,
  onClose,
}: OnlineLobbyModalProps) {
  const [subView, setSubView] = useState<'CHOICE' | 'CREATE' | 'JOIN' | 'LOBBY'>(
    initialRoomCode ? 'JOIN' : 'CHOICE'
  );

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦁');
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode);
  const [currentRoom, setCurrentRoom] = useState<OnlineRoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const availableAvatars = ['🦁', '🦅', '🐸', '🦊', '🐙', '🐬', '🐼', '🐯', '🚀', '⭐'];
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Polling update status room di lobby setiap 1.2 detik
  useEffect(() => {
    if (subView !== 'LOBBY' || !currentRoom) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${currentRoom.code}/sync`);
        if (res.ok) {
          const data = await res.json();
          if (data.state) {
            setCurrentRoom(data.state);
            if (data.state.status === 'PLAYING' && myPlayerId) {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              onGameStarted(data.state, myPlayerId);
            }
          }
        }
      } catch {
        // Abaikan transient network error
      }
    }, 1200);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [subView, currentRoom, myPlayerId, onGameStarted]);

  // Auto-restore nama & avatar dari sesi tersimpan jika ada roomCode
  useEffect(() => {
    if (initialRoomCode) {
      try {
        const raw = localStorage.getItem(`ular_session_${initialRoomCode}`);
        if (raw) {
          const s = JSON.parse(raw);
          if (s.name) setName(s.name);
          if (s.avatar) setAvatar(s.avatar);
        }
      } catch {}
    }
  }, [initialRoomCode]);

  // Handler: Buat Room Baru
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), avatar }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat room.');
      }

      // Simpan session Host ke localStorage
      try {
        localStorage.setItem(
          `ular_session_${data.roomCode}`,
          JSON.stringify({
            roomCode: data.roomCode,
            playerId: data.player.id,
            hostId: data.hostId,
            isHost: true,
            name: name.trim(),
            avatar,
          })
        );
      } catch {}

      setCurrentRoom(data.state);
      setMyPlayerId(data.player.id);
      setSubView('LOBBY');
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Gabung Room (Mendukung Reconnect)
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (!cleanCode || !name.trim()) return;
    setLoading(true);
    setErrorMsg('');

    // Baca sesi sebelumnya jika ada
    let sessionData: any = null;
    try {
      const raw = localStorage.getItem(`ular_session_${cleanCode}`);
      if (raw) sessionData = JSON.parse(raw);
    } catch {}

    try {
      const res = await fetch(`/api/rooms/${cleanCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          avatar,
          playerId: sessionData?.playerId,
          hostId: sessionData?.hostId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal bergabung ke room.');
      }

      // Simpan/perbarui session di localStorage
      try {
        localStorage.setItem(
          `ular_session_${cleanCode}`,
          JSON.stringify({
            roomCode: cleanCode,
            playerId: data.player.id,
            hostId: sessionData?.hostId || (data.player.isHost ? data.state.hostId : undefined),
            isHost: data.player.isHost,
            name: data.player.name,
            avatar: data.player.avatar,
          })
        );
      } catch {}

      setCurrentRoom(data.state);
      setMyPlayerId(data.player.id);
      setSubView('LOBBY');
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Keluar dari Lobby dan Hapus dari Database
  const handleLeaveLobby = async () => {
    if (currentRoom && myPlayerId) {
      try {
        let hostId: string | undefined;
        try {
          const raw = localStorage.getItem(`ular_session_${currentRoom.code}`);
          if (raw) hostId = JSON.parse(raw).hostId;
        } catch {}

        await fetch(`/api/rooms/${currentRoom.code}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: myPlayerId, hostId }),
        });
        localStorage.removeItem(`ular_session_${currentRoom.code}`);
      } catch (e) {
        console.warn('Gagal leave room:', e);
      }
    }
    setCurrentRoom(null);
    setMyPlayerId(null);
    setSubView('CHOICE');
  };

  // Handler: Host Mulai Game
  const handleHostStartGame = async () => {
    if (!currentRoom || !myPlayerId) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/rooms/${currentRoom.code}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START_GAME', playerId: myPlayerId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memulai permainan.');
      }

      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      onGameStarted(data.state, myPlayerId);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Gagal memulai.');
    } finally {
      setLoading(false);
    }
  };

  // Salin Link Bagikan
  const handleCopyLink = () => {
    if (!currentRoom) return;
    const url = `${window.location.origin}/?room=${currentRoom.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDismiss = onClose || onBackToModeSelect;

  return (
    <div className="modal-backdrop is-open">
      <div className="modal-card-center" style={{ position: 'relative' }}>
        {/* Tombol Tutup (✕) Modal */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Tutup modal"
          title="Tutup & kembali ke permainan"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--color-surface)',
            border: '2px solid var(--border-color)',
            borderRadius: '6px',
            padding: '3px 8px',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '2px 2px 0px var(--border-color)',
            lineHeight: 1,
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {subView === 'CHOICE' && (
          <ChoiceView
            onCreateClick={() => setSubView('CREATE')}
            onJoinClick={() => setSubView('JOIN')}
            onBack={handleDismiss}
            hasActiveGame={hasActiveGame}
          />
        )}

        {subView === 'CREATE' && (
          <CreateRoomView
            name={name}
            setName={setName}
            avatar={avatar}
            setAvatar={setAvatar}
            availableAvatars={availableAvatars}
            loading={loading}
            errorMsg={errorMsg}
            onSubmit={handleCreateRoom}
            onCancel={() => setSubView('CHOICE')}
          />
        )}

        {subView === 'JOIN' && (
          <JoinRoomView
            roomCodeInput={roomCodeInput}
            setRoomCodeInput={setRoomCodeInput}
            name={name}
            setName={setName}
            avatar={avatar}
            setAvatar={setAvatar}
            availableAvatars={availableAvatars}
            loading={loading}
            errorMsg={errorMsg}
            onSubmit={handleJoinRoom}
            onCancel={() => setSubView('CHOICE')}
          />
        )}

        {subView === 'LOBBY' && currentRoom && (
          <WaitingLobbyView
            currentRoom={currentRoom}
            myPlayerId={myPlayerId}
            copiedLink={copiedLink}
            loading={loading}
            errorMsg={errorMsg}
            onCopyLink={handleCopyLink}
            onHostStart={handleHostStartGame}
            onLeave={handleLeaveLobby}
          />
        )}
      </div>
    </div>
  );
}
