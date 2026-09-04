'use client';

import React from 'react';

interface JoinRoomViewProps {
  roomCodeInput: string;
  setRoomCodeInput: (val: string) => void;
  name: string;
  setName: (val: string) => void;
  avatar: string;
  setAvatar: (val: string) => void;
  availableAvatars: string[];
  loading: boolean;
  errorMsg: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function JoinRoomView({
  roomCodeInput,
  setRoomCodeInput,
  name,
  setName,
  avatar,
  setAvatar,
  availableAvatars,
  loading,
  errorMsg,
  onSubmit,
  onCancel,
}: JoinRoomViewProps) {
  return (
    <div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0' }}>
        Gabung Room Online
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)', margin: '0 0 20px 0', fontWeight: 600 }}>
        Masukkan kode room dari teman Anda:
      </p>

      <form onSubmit={onSubmit}>
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

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '6px' }}>
            KODE ROOM (4-8 Karakter)
          </label>
          <input
            type="text"
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
            placeholder="Contoh: ULAR-88"
            maxLength={10}
            required
            className="player-input"
            style={{
              width: '100%',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '6px' }}>
            NAMA ANDA
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Pemain"
            maxLength={15}
            required
            className="player-input"
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px' }}>
            PILIH AVATAR
          </label>
          <div className="lobby-avatar-grid">
            {availableAvatars.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setAvatar(av)}
                className={`lobby-avatar-btn ${avatar === av ? 'selected' : ''}`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            className="btn"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              flex: 2,
              justifyContent: 'center',
              backgroundColor: 'var(--color-success)',
              borderColor: 'var(--border-color)',
            }}
          >
            {loading ? 'Menghubungkan...' : 'Masuk Room ➔'}
          </button>
        </div>
      </form>
    </div>
  );
}
