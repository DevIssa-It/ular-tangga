'use client';

import React from 'react';
import { Player } from '@/lib/types';

interface WinnerModalProps {
  winner: Player;
  onRematch: () => void;
  onNewGame: () => void;
  onClose?: () => void;
}

export default function WinnerModal({ winner, onRematch, onNewGame, onClose }: WinnerModalProps) {
  return (
    <div className="modal-backdrop is-open">
      <div className="modal-box winner-card-center" style={{ position: 'relative' }}>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            title="Tutup modal & lihat papan"
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
        )}
        <div className="winner-crown">👑</div>
        <h2 className="winner-title">{winner.name} Menang!</h2>
        <p className="winner-subtitle" style={{ marginBottom: '8px' }}>
          Berhasil mencapai Petak 100 dengan gemilang!
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-success-light)',
              border: '2px solid var(--color-success)',
              color: '#166534',
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 800,
            }}
          >
            🏆 Hasil Pertandingan Berhasil Dicatat
          </span>
        </div>

        {/* Statistik Pemenang (Solid Grid) */}
        <div className="winner-stats-grid">
          <div className="stat-item">
            <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
              {winner.turnsTaken}
            </div>
            <div className="stat-label">Total Giliran</div>
          </div>

          <div className="stat-item">
            <div className="stat-value" style={{ color: 'var(--color-quiz)' }}>
              {winner.quizzesCorrect} / {winner.quizzesAnswered}
            </div>
            <div className="stat-label">Kuis Tepat</div>
          </div>

          <div className="stat-item">
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>
              {winner.laddersClimbed}
            </div>
            <div className="stat-label">Tangga Dinaiki</div>
          </div>

          <div className="stat-item">
            <div className="stat-value" style={{ color: 'var(--color-danger)' }}>
              {winner.snakesBitten}
            </div>
            <div className="stat-label">Ular Digigit</div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onRematch}
            style={{ flex: 1, minWidth: '170px', justifyContent: 'center', padding: '12px 16px' }}
          >
            🔄 Main Lagi (Pemain Sama)
          </button>
          <button
            type="button"
            className="btn"
            onClick={onNewGame}
            style={{ flex: 1, minWidth: '150px', justifyContent: 'center', padding: '12px 16px' }}
          >
            ⚙️ Atur Ulang Pemain
          </button>
        </div>
      </div>
    </div>
  );
}
