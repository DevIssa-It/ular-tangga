import React from 'react';
import { Player } from '@/lib/types';

interface PlayerSidebarProps {
  players: Player[];
  activePlayerIndex: number;
}

export default function PlayerSidebar({ players, activePlayerIndex }: PlayerSidebarProps) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Daftar Pemain ({players.length})
        </h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink-muted)' }}>
          Target: Petak 100
        </span>
      </div>

      <div className="players-list">
        {players.map((player, idx) => {
          const isCurrent = idx === activePlayerIndex;

          return (
            <div
              key={player.id}
              className={`player-card ${isCurrent ? 'is-current' : ''}`}
              style={{
                borderLeftWidth: '5px',
                borderLeftColor: player.color,
              }}
            >
              <div className="player-card-meta">
                <div className="player-avatar-icon" style={{ backgroundColor: player.color }}>
                  {player.avatar}
                </div>
                <div className="player-name-wrap">
                  <div className="player-card-name">
                    {player.name} {isCurrent && '🎯'}
                  </div>
                  <div className="player-card-stats">
                    Kuis: {player.quizzesCorrect} ✓ | 🪜 {player.laddersClimbed} | 🐍 {player.snakesBitten}
                  </div>
                </div>
              </div>

              <div className="player-card-pos" title={`Posisi Petak ${player.position}`}>
                {player.position}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
