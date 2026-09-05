'use client';

import React from 'react';
import { GameLogEntry } from '@/lib/types';

interface GameLogProps {
  logs: GameLogEntry[];
}

export default function GameLog({ logs }: GameLogProps) {
  return (
    <div className="game-log-card">
      <div className="game-log-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📜 Riwayat Permainan</span>
          <span className="game-log-count-badge">
            {logs.length} Aksi
          </span>
        </div>
      </div>

      <ul className="log-entries">
        {logs.length === 0 ? (
          <li style={{ padding: '6px 8px', color: 'var(--color-ink-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
            Permainan dimulai. Lempar dadu untuk melangkah!
          </li>
        ) : (
          logs.slice(0, 25).map((log) => (
            <li key={log.id} className={`log-entry ${log.type}`}>
              {log.text}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
