'use client';

import React, { useState } from 'react';
import { Player } from '@/lib/types';
import { DEFAULT_PLAYER_PRESETS } from '@/lib/board-config';

interface SetupModalProps {
  onStartGame: (players: Player[]) => void;
  onClose?: () => void;
}

export default function SetupModal({ onStartGame, onClose }: SetupModalProps) {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [playersData, setPlayersData] = useState(
    DEFAULT_PLAYER_PRESETS.map((preset) => ({
      name: preset.name,
      color: preset.color,
      avatar: preset.avatar,
    }))
  );

  const availableAvatars = ['🦁', '🦅', '🐸', '🦊', '🐙', '🐬', '🐼', '🐯', '🚀', '⭐'];

  const handleCountChange = (count: number) => {
    setPlayerCount(count);
  };

  const handleNameChange = (index: number, newName: string) => {
    setPlayersData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], name: newName };
      return updated;
    });
  };

  const handleAvatarSelect = (index: number, newAvatar: string) => {
    setPlayersData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], avatar: newAvatar };
      return updated;
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      finalPlayers.push({
        id: i + 1,
        name: playersData[i].name.trim() || `Pemain ${i + 1}`,
        color: playersData[i].color,
        avatar: playersData[i].avatar,
        position: 1,
        previousPosition: 1,
        quizzesAnswered: 0,
        quizzesCorrect: 0,
        laddersClimbed: 0,
        snakesBitten: 0,
        turnsTaken: 0,
      });
    }
    onStartGame(finalPlayers);
  };

  return (
    <div className="modal-backdrop is-open">
      <div className="modal-card-center" style={{ maxWidth: '540px', position: 'relative' }}>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dan kembali ke permainan"
            title="Batal & Lanjut Bermain"
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

        {/* Header Modal */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '2.4rem', marginBottom: '6px' }}>🎲 🐍 🪜</div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Mulai Permainan Baru
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-ink-muted)', margin: 0, fontWeight: 600 }}>
            Pilih jumlah pemain (2 s.d. 6 orang) dan tentukan nama serta avatar.
          </p>
        </div>

        <form onSubmit={handleFormSubmit}>
          {/* Pemilih Jumlah Pemain */}
          <div style={{ marginBottom: '20px' }}>
            <label>
              Jumlah Pemain
            </label>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              {[2, 3, 4, 5, 6].map((num) => {
                const isActive = playerCount === num;
                return (
                  <button
                    key={`count-${num}`}
                    type="button"
                    onClick={() => handleCountChange(num)}
                    className={`setup-count-btn ${isActive ? 'active' : ''}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daftar Input Pemain */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {Array.from({ length: playerCount }).map((_, idx) => (
              <div
                key={`player-field-${idx}`}
                className="setup-player-card"
                style={{ borderLeft: `6px solid ${playersData[idx].color}` }}
              >
                {/* Baris Atas: Avatar Preview + Nama Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Avatar Lingkaran Solid */}
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      minWidth: '42px',
                      borderRadius: '9999px',
                      border: '2.5px solid var(--border-color)',
                      boxShadow: '2px 2px 0px var(--border-color)',
                      backgroundColor: playersData[idx].color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                    }}
                    title={`Pemain ${idx + 1}`}
                  >
                    {playersData[idx].avatar}
                  </div>

                  {/* Input Nama dengan Styling Neo-Brutalist */}
                  <input
                    type="text"
                    value={playersData[idx].name}
                    maxLength={15}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder={`Nama Pemain ${idx + 1}`}
                    required
                    className="player-input"
                    style={{ flex: 1 }}
                  />
                </div>

                {/* Baris Bawah: Pilihan Avatar Cepat (Emoji Pills) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-ink-muted)', marginRight: '4px' }}>
                    Avatar:
                  </span>
                  {availableAvatars.map((av) => {
                    const isSelected = playersData[idx].avatar === av;
                    return (
                      <button
                        key={av}
                        type="button"
                        onClick={() => handleAvatarSelect(idx, av)}
                        className={`setup-avatar-pill ${isSelected ? 'selected' : ''}`}
                        title={`Pilih avatar ${av}`}
                      >
                        {av}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Kotak Info Petunjuk */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--color-quiz-light)',
              borderRadius: '10px',
              border: '2px solid var(--color-quiz)',
              boxShadow: '2px 2px 0px var(--color-quiz)',
              fontSize: '0.82rem',
              marginBottom: '20px',
              fontWeight: 600,
              color: '#881337',
              lineHeight: 1.45,
            }}
          >
            ❓ <strong>Fitur Kuis Acak:</strong> Saat mendarat di petak kuis, pemain harus menjawab pertanyaan trivia dalam 15 detik. Jawaban benar dapat bonus <strong>+2 petak</strong>, jawaban salah terkena penalti <strong>-1 petak</strong>!
          </div>

          {/* Tombol Mulai Bermain */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-lg"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                ← Batal & Lanjut Main
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ flex: onClose ? 2 : 1, justifyContent: 'center' }}
            >
              <span>{onClose ? 'Mulai Ulang Baru 🚀' : 'Mulai Bermain Sekarang! 🚀'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
