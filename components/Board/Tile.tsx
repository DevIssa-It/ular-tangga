import React from 'react';
import { LADDERS, SNAKES, QUIZ_TILES } from '@/lib/board-config';

interface TileProps {
  tileNumber: number;
  isQuiz?: boolean;
}

export default function Tile({ tileNumber, isQuiz }: TileProps) {
  const isOdd = tileNumber % 2 !== 0;
  const showQuiz = isQuiz !== undefined ? isQuiz : QUIZ_TILES.has(tileNumber);

  // Cek apakah petak ini adalah awal tangga (naik)
  const ladder = LADDERS.find((l) => l.start === tileNumber);
  // Cek apakah petak ini adalah kepala ular (turun)
  const snake = SNAKES.find((s) => s.start === tileNumber);

  return (
    <div
      className={`board-tile ${isOdd ? 'odd' : ''} ${showQuiz ? 'is-quiz' : ''}`}
      data-tile={tileNumber}
    >
      <div className="tile-number">
        {tileNumber === 100 ? '👑 100' : tileNumber === 1 ? '🚩 1' : tileNumber}
      </div>

      {showQuiz && (
        <div className="tile-badge-quiz">
          <span>❓</span>
          <span>Kuis</span>
        </div>
      )}

      {ladder && (
        <div className="tile-icon-indicator ladder-start" title={`Tangga ke petak ${ladder.end}`}>
          🪜 ↑{ladder.end}
        </div>
      )}

      {snake && (
        <div className="tile-icon-indicator snake-head" title={`Ular turun ke petak ${snake.end}`}>
          🐍 ↓{snake.end}
        </div>
      )}
    </div>
  );
}
