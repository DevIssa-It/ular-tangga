'use client';

import React, { useState } from 'react';
import { soundEngine } from '@/lib/audio';

interface QuickChatBarProps {
  senderName: string;
  onSendTaunt: (text: string) => void;
}

const PRESET_TAUNTS = [
  'Yah kasian! 😜',
  'Awas ular! 🐍',
  'Mau nyalip! 🚀',
  'Jangan panik! 🤫',
  'Gitu doang? 😏',
  'Skill issue! 📉',
  'Dikit lagi! 🏁',
  'Santai dulu! ☕',
  'Hoki doang! 🎲',
  'Semangat ya! 👶',
];

export default function QuickChatBar({ senderName, onSendTaunt }: QuickChatBarProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    soundEngine.playTaunt();
    onSendTaunt(trimmed);
    setText('');
  };

  const handleSelectPreset = (preset: string) => {
    soundEngine.playTaunt();
    onSendTaunt(preset);
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-ink)', textTransform: 'uppercase' }}>
          💬 Chat & Ejekan Bidak
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', fontWeight: 700 }}>
          {senderName}
        </span>
      </div>

      {/* Grid Ejekan Instan 1-Tap (2 Kolom) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
        {PRESET_TAUNTS.map((t, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectPreset(t)}
            style={{
              padding: '6px 8px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '1.5px 1.5px 0px var(--border-color)',
              color: 'var(--color-ink)',
            }}
            title="Klik untuk langsung ejek"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Form Input Chat Bebas */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '6px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={60}
          placeholder="Ketik pesan..."
          style={{
            flex: 1,
            padding: '6px 10px',
            fontSize: '0.82rem',
            fontWeight: 700,
            border: '2px solid var(--border-color)',
            borderRadius: '6px',
            outline: 'none',
            boxShadow: '1.5px 1.5px 0px var(--border-color)',
          }}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn btn-primary btn-sm"
          style={{ padding: '6px 12px', fontSize: '0.8rem', flexShrink: 0 }}
        >
          Kirim 🚀
        </button>
      </form>
    </div>
  );
}
