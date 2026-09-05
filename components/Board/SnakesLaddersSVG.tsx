import React from 'react';
import LaddersSVG from './LaddersSVG';
import SnakesSVG from './SnakesSVG';

export default function SnakesLaddersSVG() {
  return (
    <svg
      className="board-svg-overlay"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <LaddersSVG />
      <SnakesSVG />
    </svg>
  );
}
