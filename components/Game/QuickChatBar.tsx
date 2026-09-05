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
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '2px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        maxWidth: '650px',
        margin: '10px auto 0 auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Baris 1: Strip Ejekan Instan 1-Tap (Scroll Horizontal) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-ink-muted)', flexShrink: 0 }}>
          ⚡ Ejekan:
        </span>
        {PRESET_TAUNTS.map((t, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectPreset(t)}
            style={{
              padding: '4px 10px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '1.5px 1.5px 0px var(--border-color)',
              color: 'var(--color-ink)',
              flexShrink: 0,
            }}
            title="Klik untuk langsung ejek"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Baris 2: Input Chat Bebas Langsung */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '6px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={60}
          placeholder={`Chat langsung sebagai ${senderName}... (maks 60 huruf)`}
          style={{
            flex: 1,
            padding: '6px 10px',
            fontSize: '0.85rem',
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
          style={{ padding: '6px 14px', fontSize: '0.82rem', flexShrink: 0 }}
        >
          Kirim 🚀
        </button>
      </form>
    </div>
  );
}
