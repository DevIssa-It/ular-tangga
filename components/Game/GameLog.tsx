import React from 'react';
import { GameLogEntry } from '@/lib/types';

interface GameLogProps {
  logs: GameLogEntry[];
}

export default function GameLog({ logs }: GameLogProps) {
  return (
    <div className="game-log-card">
      <div className="game-log-title">
        <span>Riwayat Permainan</span>
        <span>{logs.length} Aksi</span>
      </div>
      <ul className="log-entries">
        {logs.slice(0, 15).map((log) => (
          <li key={log.id} className={`log-entry ${log.type}`}>
            {log.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
