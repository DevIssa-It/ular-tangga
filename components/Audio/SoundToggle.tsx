'use client';

import React, { useState, useEffect } from 'react';
import { soundEngine } from '@/lib/audio';

export default function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(soundEngine.isMuted());
  }, []);

  const toggleSound = () => {
    const isNowMuted = soundEngine.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <button
      type="button"
      onClick={toggleSound}
      className="btn btn-sm"
      aria-label={muted ? 'Aktifkan Suara' : 'Bisukan Suara'}
      title={muted ? 'Aktifkan Suara' : 'Bisukan Suara'}
    >
      <span>{muted ? '🔇' : '🔊'}</span>
      <span>{muted ? 'Muted' : 'Audio On'}</span>
    </button>
  );
}
