'use client';

import React, { useState } from 'react';
import { soundEngine } from '@/lib/audio';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTaunt: (text: string) => void;
  senderName: string;
}

const PRESET_TAUNTS = [
  'Yah kasian deh! 😜',
  'Awas kepeleset ular! 🐍',
  'Mau nyalip nih bos! 🚀',
  'Jangan panik dong! 🤫',
  'Gitu doang mainnya? 😏',
  'Skill issue detected! 📉',
  'Dikit lagi finish nih! 🏁',
  'Santai dulu gak sih? ☕',
  'Hoki doang itu mah! 🎲',
  'Semangat ya dek! 👶',
];

export default function ChatDrawer({
  isOpen,
  onClose,
  onSendTaunt,
  senderName,
}: ChatDrawerProps) {
  const [customText, setCustomText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customText.trim();
    if (!trimmed) return;
    soundEngine.playTaunt();
    onSendTaunt(trimmed);
    setCustomText('');
    onClose();
  };

  const handleSelectPreset = (taunt: string) => {
    soundEngine.playTaunt();
    onSendTaunt(taunt);
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1000 }} onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: 440, padding: '20px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#18181B' }}>
              💬 Chat & Balon Ejekan
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>
              Kirim kata-kata sebagai {senderName}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: '2px solid #18181B',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 800,
              padding: '4px 8px',
              fontSize: '0.85rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Input Pesan Bebas */}
        <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              maxLength={60}
              placeholder="Ketik pesan bebas... (maks 60 huruf)"
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '0.9rem',
                fontWeight: 700,
                border: '2px solid #18181B',
                borderRadius: 6,
                outline: 'none',
                boxShadow: '2px 2px 0px #18181B',
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={!customText.trim()}
              className="btn btn-primary"
              style={{ padding: '8px 14px', fontSize: '0.9rem' }}
            >
              Kirim
            </button>
          </div>
        </form>

        {/* Daftar Quick Taunt Presets */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>
            ⚡ Ejekan Instan (1-Klik):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {PRESET_TAUNTS.map((taunt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(taunt)}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  background: '#FFFFFF',
                  border: '2px solid #18181B',
                  borderRadius: 6,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px #18181B',
                  transition: 'transform 0.1s ease',
                  color: '#0F172A',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'translate(1px, 1px)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'none')}
              >
                {taunt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
