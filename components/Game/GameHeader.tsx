'use client';

import React from 'react';
import SoundToggle from '@/components/Audio/SoundToggle';
import { Player, PlayMode, OnlineRoomState } from '@/lib/types';

interface GameHeaderProps {
  playMode: PlayMode | 'SELECT';
  onlineRoom: OnlineRoomState | null;
  myPlayer: Player | null | undefined;
  copiedLink: boolean;
  onCopyRoomLink: () => void;
  onLeaveOnlineRoom: () => void;
  onSwitchToOnline: () => void;
  onResetLocal: () => void;
}

export default function GameHeader({
  playMode,
  onlineRoom,
  myPlayer,
  copiedLink,
  onCopyRoomLink,
  onLeaveOnlineRoom,
  onSwitchToOnline,
  onResetLocal,
}: GameHeaderProps) {
  return (
    <header className="app-header">
      <div className="brand-container">
        <div className="brand-badge">S&L</div>
        <h1 className="brand-title">Ular Tangga Trivia</h1>
      </div>

      <div className="header-actions">
        {/* Status & Kontrol Mode Online */}
        {playMode === 'ONLINE' && onlineRoom && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--color-primary-light)',
                border: '2px solid var(--color-primary)',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: 'var(--color-primary-dark)',
              }}
            >
              <span>🌐 Room:</span>
              <span style={{ letterSpacing: '0.04em' }}>{onlineRoom.code}</span>
              <button
                type="button"
                onClick={onCopyRoomLink}
                className="btn btn-sm btn-primary"
                style={{
                  padding: '2px 6px',
                  fontSize: '0.72rem',
                  marginLeft: '4px',
                }}
                title="Salin link room untuk dibagikan ke teman"
              >
                {copiedLink ? '✓ Disalin!' : '📋 Salin Link'}
              </button>
            </div>

            {myPlayer && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-surface)',
                  border: '2px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                <span>Anda:</span>
                <span style={{ fontSize: '1rem' }}>{myPlayer.avatar}</span>
                <strong style={{ color: myPlayer.color }}>{myPlayer.name}</strong>
                {myPlayer.isHost && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      backgroundColor: '#D97706',
                      color: '#FFFFFF',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      fontWeight: 800,
                    }}
                  >
                    HOST
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              className="btn btn-sm"
              onClick={onLeaveOnlineRoom}
              title="Keluar dari room online"
              style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
            >
              🚪 Keluar Room
            </button>
          </div>
        )}

        {/* Kontrol Mode Lokal */}
        {playMode === 'LOCAL' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={onSwitchToOnline}
              title="Main bersama teman dari HP masing-masing via Neon DB"
              style={{
                backgroundColor: 'var(--color-primary-light)',
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary-dark)',
              }}
            >
              🌐 Main Online (Banyak HP)
            </button>

            <button
              type="button"
              className="btn btn-sm"
              onClick={onResetLocal}
              title="Mulai Ulang atau Ganti Pemain Lokal"
            >
              ⚙️ Reset / Pemain
            </button>
          </div>
        )}

        <SoundToggle />
      </div>
    </header>
  );
}
