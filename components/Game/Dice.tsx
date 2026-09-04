'use client';

import React from 'react';

interface DiceProps {
  value: number;
  isRolling: boolean;
  disabled: boolean;
  onRoll: () => void;
  activePlayerName: string;
}

export default function Dice({ value, isRolling, disabled, onRoll, activePlayerName }: DiceProps) {
  // Buat jumlah dot sesuai angka 1-6
  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < value; i++) {
      dots.push(<div key={`dot-${i}`} className="dice-dot" />);
    }
    return dots;
  };

  return (
    <div className="dice-container">
      <div className="dice-wrapper">
        <div
          className={`dice ${isRolling ? 'rolling' : ''}`}
          data-val={value}
          onClick={!disabled && !isRolling ? onRoll : undefined}
          title="Klik dadu atau tombol untuk melempar"
        >
          {renderDots()}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-lg"
        onClick={onRoll}
        disabled={disabled || isRolling}
      >
        <span>🎲</span>
        <span className="roll-btn-label">
          {isRolling ? 'Mengocok Dadu...' : `Lempar Dadu (${activePlayerName})`}
        </span>
      </button>
    </div>
  );
}
