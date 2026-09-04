'use client';

import React from 'react';

interface ModeSelectModalProps {
  onSelectLocal: () => void;
  onSelectOnline: () => void;
  hasActiveGame?: boolean;
  onClose?: () => void;
}

export default function ModeSelectModal({
  onSelectLocal,
  onSelectOnline,
  hasActiveGame = false,
  onClose,
}: ModeSelectModalProps) {
  return (
    <div className="modal-backdrop is-open">
      <div className="modal-card-center" style={{ textAlign: 'center', position: 'relative' }}>
        {/* Tombol Tutup (✕) jika ada game aktif atau onClose */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            title="Kembali ke permainan"
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
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎲 🐍 🪜</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
          Ular Tangga Trivia
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-ink-muted)', margin: '0 0 24px 0', fontWeight: 600 }}>
          Pilih mode permainan yang ingin Anda mainkan:
        </p>

        <div className="mode-card-options">
          {/* Opsi 1: Main Lokal (1 Perangkat) */}
          <button type="button" onClick={onSelectLocal} className="mode-option-btn">
            <div className="mode-option-icon local">📱</div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-ink)' }}>
                Main Lokal (1 Layar)
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-ink-muted)', fontWeight: 600, marginTop: '2px' }}>
                Pass-and-play bersama 2 s.d. 6 orang dalam 1 HP, Tablet, atau Laptop.
              </div>
            </div>
          </button>

          {/* Opsi 2: Main Online (Banyak HP via Neon DB) */}
          <button type="button" onClick={onSelectOnline} className="mode-option-btn online">
            <div className="mode-option-icon online">🌐</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                  Main Online (Banyak HP)
                </span>
                <span className="mode-badge-tag">NEON DB</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: 600, marginTop: '2px' }}>
                Buat room online, bagikan kode/link, dan main bersama dari HP masing-masing!
              </div>
            </div>
          </button>
        </div>

        {hasActiveGame && onClose && (
          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              🎮 Batal & Kembali ke Permainan yang Sedang Berjalan
            </button>
          </div>
        )}

        <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-faint)', fontWeight: 600 }}>
          ⚡ Siap deploy di Vercel dalam 1 project All-in-One.
        </div>
      </div>
    </div>
  );
}
