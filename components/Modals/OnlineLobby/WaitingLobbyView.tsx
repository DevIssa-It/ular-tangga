'use client';

import React from 'react';
import { OnlineRoomState } from '@/lib/types';

interface WaitingLobbyViewProps {
  currentRoom: OnlineRoomState;
  myPlayerId: number | null;
  copiedLink: boolean;
  loading: boolean;
  errorMsg: string;
  onCopyLink: () => void;
  onHostStart: () => void;
  onLeave: () => void;
}

export default function WaitingLobbyView({
  currentRoom,
  myPlayerId,
  copiedLink,
  loading,
  errorMsg,
  onCopyLink,
  onHostStart,
  onLeave,
}: WaitingLobbyViewProps) {
  const isHost = currentRoom.players.find((p) => p.id === myPlayerId)?.isHost ?? false;
  const canStart = currentRoom.players.length >= 2;

  return (
    <div>
      {/* Tampilan Kode Room & Tombol Salin */}
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-muted)' }}>
          KODE ROOM ONLINE
        </div>
        <div className="lobby-code-display">
          <span className="lobby-code-text">{currentRoom.code}</span>
        </div>

        <div>
          <button
            type="button"
            onClick={onCopyLink}
            className="btn btn-sm"
            style={{ fontSize: '0.82rem' }}
          >
            {copiedLink ? '✓ Link Berhasil Disalin!' : '🔗 Salin Link Room untuk Teman'}
          </button>
        </div>
      </div>

      {/* Daftar Pemain di Ruang Tunggu */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            fontWeight: 800,
            marginBottom: '8px',
          }}
        >
          <span>PEMAIN DI ROOM ({currentRoom.players.length}/6)</span>
          <span style={{ color: 'var(--color-success)' }}>● Real-time Live</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentRoom.players.map((p) => {
            const isMe = p.id === myPlayerId;
            return (
              <div
                key={p.id}
                className="lobby-player-card"
                style={{ borderLeft: `5px solid ${p.color}` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{p.avatar}</span>
                  <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                    {p.name} {p.isHost && '👑 (Host)'} {isMe && '👤 (Anda)'}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink-muted)' }}>
                  Siap
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '10px',
            backgroundColor: 'var(--color-danger-light)',
            border: '1.5px solid var(--color-danger)',
            borderRadius: '8px',
            color: '#991B1B',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '14px',
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Kontrol Aksi: Host vs Guest */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isHost ? (
          <>
            <button
              type="button"
              onClick={onHostStart}
              disabled={!canStart || loading}
              className="btn btn-primary btn-lg"
              style={{ justifyContent: 'center' }}
            >
              {loading ? 'Memulai Permainan...' : canStart ? 'Mulai Permainan Sekarang 🎮' : 'Menunggu Pemain Lain (Min. 2)...'}
            </button>
            {!canStart && (
              <div style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)', textAlign: 'center', fontWeight: 600 }}>
                Bagikan kode di atas ke teman Anda agar bisa bergabung!
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-primary-light)',
              border: '2px solid var(--color-primary)',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: 'var(--color-primary-dark)',
            }}
          >
            ⏳ Menunggu Host memulai permainan...
          </div>
        )}

        <button
          type="button"
          onClick={onLeave}
          className="btn"
          style={{ justifyContent: 'center', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
        >
          Keluar dari Room
        </button>
      </div>
    </div>
  );
}
