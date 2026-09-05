import React from 'react';

interface PlayerSetupCardProps {
  index: number;
  name: string;
  color: string;
  avatar: string;
  availableAvatars: string[];
  onNameChange: (index: number, name: string) => void;
  onAvatarSelect: (index: number, avatar: string) => void;
}

export default function PlayerSetupCard({
  index,
  name,
  color,
  avatar,
  availableAvatars,
  onNameChange,
  onAvatarSelect,
}: PlayerSetupCardProps) {
  return (
    <div
      className="setup-player-card"
      style={{ borderLeft: `6px solid ${color}` }}
    >
      {/* Baris Atas: Avatar Preview + Nama Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            minWidth: '42px',
            borderRadius: '9999px',
            border: '2.5px solid var(--border-color)',
            boxShadow: '2px 2px 0px var(--border-color)',
            backgroundColor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
          }}
          title={`Pemain ${index + 1}`}
        >
          {avatar}
        </div>

        <input
          type="text"
          value={name}
          maxLength={15}
          onChange={(e) => onNameChange(index, e.target.value)}
          placeholder={`Nama Pemain ${index + 1}`}
          required
          className="player-input"
          style={{ flex: 1 }}
        />
      </div>

      {/* Baris Bawah: Pilihan Avatar Cepat (Emoji Pills) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: 'var(--color-ink-muted)',
            marginRight: '4px',
          }}
        >
          Avatar:
        </span>
        {availableAvatars.map((av) => {
          const isSelected = avatar === av;
          return (
            <button
              key={av}
              type="button"
              onClick={() => onAvatarSelect(index, av)}
              className={`setup-avatar-pill ${isSelected ? 'selected' : ''}`}
              title={`Pilih avatar ${av}`}
            >
              {av}
            </button>
          );
        })}
      </div>
    </div>
  );
}
