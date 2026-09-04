'use client';

import React from 'react';

interface ChoiceViewProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
  onBack: () => void;
  hasActiveGame?: boolean;
}

export default function ChoiceView({
  onCreateClick,
  onJoinClick,
  onBack,
  hasActiveGame = false,
}: ChoiceViewProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌐 🎲</div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0' }}>
        Main Online Bersama Teman
      </h2>
      <p style={{ fontSize: '0.88rem', color: 'var(--color-ink-muted)', margin: '0 0 24px 0', fontWeight: 600 }}>
        Main bersama teman dari HP atau laptop masing-masing secara real-time.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={onCreateClick}
          className="btn btn-primary"
          style={{ padding: '14px', fontSize: '1.05rem', justifyContent: 'center' }}
        >
          ➕ Buat Room Baru (Sebagai Host)
        </button>

        <button
          type="button"
          onClick={onJoinClick}
          className="btn"
          style={{ padding: '14px', fontSize: '1.05rem', justifyContent: 'center' }}
        >
          🔑 Gabung Room dengan Kode
        </button>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="btn btn-sm"
        style={{
          width: '100%',
          justifyContent: 'center',
          backgroundColor: hasActiveGame ? 'var(--color-surface-subtle)' : 'transparent',
          borderColor: 'var(--border-color)',
          fontWeight: 700,
          fontSize: '0.88rem',
        }}
      >
        {hasActiveGame ? '🎮 Kembali ke Permainan yang Sedang Berjalan' : '← Kembali ke Pilihan Mode'}
      </button>
    </div>
  );
}
