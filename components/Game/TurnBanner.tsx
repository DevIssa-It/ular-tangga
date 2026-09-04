import React from 'react';
import { Player, GamePhase } from '@/lib/types';

interface TurnBannerProps {
  player: Player;
  phase: GamePhase;
  hasBonusRoll?: boolean;
  onOpenWinnerStats?: () => void;
}

export default function TurnBanner({
  player,
  phase,
  hasBonusRoll,
  onOpenWinnerStats,
}: TurnBannerProps) {
  const getStatusMessage = () => {
    if (phase === 'WAIT_ROLL' && hasBonusRoll) {
      return '🎲 Dadu 6! Lempar Lagi!';
    }
    switch (phase) {
      case 'WAIT_ROLL':
        return 'Giliran Lempar Dadu';
      case 'ROLLING':
        return 'Mengocok Dadu...';
      case 'MOVING':
        return 'Melangkah di Papan...';
      case 'ON_SPECIAL':
        return 'Peristiwa Spesial!';
      case 'QUIZ_ACTIVE':
        return 'Tantangan Kuis!';
      case 'QUIZ_RESULT':
        return 'Evaluasi Jawaban...';
      case 'GAME_OVER':
        return '🏆 Pemenang Ditemukan!';
      default:
        return 'Sedang Berjalan';
    }
  };

  return (
    <div className="turn-banner">
      <div className="turn-player-info">
        <div className="turn-avatar-badge" style={{ backgroundColor: player.color }}>
          {player.avatar}
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-muted)' }}>
            Giliran Pemain
          </div>
          <div className="turn-name">{player.name}</div>
        </div>
      </div>

      <div className="turn-status-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{getStatusMessage()}</span>
        {phase === 'GAME_OVER' && onOpenWinnerStats && (
          <button
            type="button"
            onClick={onOpenWinnerStats}
            className="btn btn-sm"
            style={{
              padding: '2px 8px',
              fontSize: '0.74rem',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary-dark)',
              borderColor: 'var(--color-primary)',
            }}
          >
            🏆 Lihat Hasil
          </button>
        )}
      </div>
    </div>
  );
}
