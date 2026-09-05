'use client';

import { useState, useEffect, useRef } from 'react';
import { OnlineRoomState } from '@/lib/types';

interface UseLobbyControllerProps {
  initialRoomCode?: string;
  onGameStarted: (room: OnlineRoomState, myPlayerId: number) => void;
}

export function useLobbyController({ initialRoomCode = '', onGameStarted }: UseLobbyControllerProps) {
  const [subView, setSubView] = useState<'CHOICE' | 'CREATE' | 'JOIN' | 'LOBBY'>(initialRoomCode ? 'JOIN' : 'CHOICE');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦁');
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode);
  const [currentRoom, setCurrentRoom] = useState<OnlineRoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Polling update status room di lobby
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
      } catch {}
    }, 1200);
    return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
  }, [subView, currentRoom, myPlayerId, onGameStarted]);

  // Restore nama & avatar jika ada sesi tersimpan
  useEffect(() => {
    if (!initialRoomCode) return;
    try {
      const raw = localStorage.getItem(`ular_session_${initialRoomCode}`);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.name) setName(s.name);
        if (s.avatar) setAvatar(s.avatar);
      }
    } catch {}
  }, [initialRoomCode]);

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
      if (!res.ok || !data.success) throw new Error(data.error || 'Gagal membuat room.');
      try {
        localStorage.setItem(`ular_session_${data.roomCode}`, JSON.stringify({
          roomCode: data.roomCode, playerId: data.player.id, hostId: data.hostId, isHost: true, name: name.trim(), avatar,
        }));
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

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (!cleanCode || !name.trim()) return;
    setLoading(true);
    setErrorMsg('');
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
          name: name.trim(), avatar, playerId: sessionData?.playerId, hostId: sessionData?.hostId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Gagal bergabung ke room.');
      try {
        localStorage.setItem(`ular_session_${cleanCode}`, JSON.stringify({
          roomCode: cleanCode, playerId: data.player.id, hostId: sessionData?.hostId || (data.player.isHost ? data.state.hostId : undefined),
          isHost: data.player.isHost, name: data.player.name, avatar: data.player.avatar,
        }));
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

  const handleLeaveLobby = async () => {
    if (currentRoom && myPlayerId) {
      try {
        let hostId: string | undefined;
        const raw = localStorage.getItem(`ular_session_${currentRoom.code}`);
        if (raw) hostId = JSON.parse(raw).hostId;
        await fetch(`/api/rooms/${currentRoom.code}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: myPlayerId, hostId }),
        });
        localStorage.removeItem(`ular_session_${currentRoom.code}`);
      } catch {}
    }
    setCurrentRoom(null);
    setMyPlayerId(null);
    setSubView('CHOICE');
  };

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
      if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memulai permainan.');
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      onGameStarted(data.state, myPlayerId);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Gagal memulai game.');
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!currentRoom) return;
    navigator.clipboard.writeText(`${window.location.origin}/?room=${currentRoom.code}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return {
    subView, setSubView, name, setName, avatar, setAvatar, roomCodeInput, setRoomCodeInput,
    currentRoom, myPlayerId, loading, errorMsg, copiedLink, handleCreateRoom, handleJoinRoom,
    handleLeaveLobby, handleHostStartGame, handleCopyLink,
  };
}
