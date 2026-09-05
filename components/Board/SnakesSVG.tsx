import React from 'react';
import { SNAKES, getTileCenterPercent } from '@/lib/board-config';

export default function SnakesSVG() {
  return (
    <g className="svg-snakes-group">
      {SNAKES.map((snake, idx) => {
        const head = getTileCenterPercent(snake.start);
        const tail = getTileCenterPercent(snake.end);

        const dx = tail.x - head.x;
        const dy = tail.y - head.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const curvature = (idx % 2 === 0 ? 1 : -1) * Math.min(6, len * 0.18);

        const cp1x = head.x + dx * 0.25 + curvature;
        const cp1y = head.y + dy * 0.25;
        const cp2x = head.x + dx * 0.75 - curvature;
        const cp2y = head.y + dy * 0.75;

        const pathData = [
          `M ${head.x} ${head.y}`,
          `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tail.x} ${tail.y}`,
        ].join(' ');

        const tonguePath = [
          `M ${head.x} ${head.y - 1.9}`,
          `L ${head.x} ${head.y - 3.0}`,
          `M ${head.x} ${head.y - 3.0}`,
          `L ${head.x - 0.6} ${head.y - 3.7}`,
          `M ${head.x} ${head.y - 3.0}`,
          `L ${head.x + 0.6} ${head.y - 3.7}`,
        ].join(' ');

        return (
          <g key={`snake-${idx}`}>
            {/* Garis batas luar tubuh ular solid */}
            <path
              d={pathData}
              fill="none"
              stroke="#991B1B"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Tubuh utama ular warna Merah Solid */}
            <path
              d={pathData}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pola punggung ular solid */}
            <path
              d={pathData}
              fill="none"
              stroke="#FEE2E2"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeDasharray="1.2 2.4"
            />

            {/* Ekor Lancip */}
            <circle cx={tail.x} cy={tail.y} r="0.7" fill="#991B1B" />

            {/* Kepala Ular */}
            <circle
              cx={head.x}
              cy={head.y}
              r="1.9"
              fill="#DC2626"
              stroke="#7F1D1D"
              strokeWidth="0.5"
            />

            {/* Mata Ular */}
            <circle
              cx={head.x - 0.7}
              cy={head.y - 0.5}
              r="0.55"
              fill="#FFFFFF"
              stroke="#18181B"
              strokeWidth="0.2"
            />
            <circle
              cx={head.x + 0.7}
              cy={head.y - 0.5}
              r="0.55"
              fill="#FFFFFF"
              stroke="#18181B"
              strokeWidth="0.2"
            />
            <circle
              cx={head.x - 0.7}
              cy={head.y - 0.5}
              r="0.28"
              fill="#18181B"
            />
            <circle
              cx={head.x + 0.7}
              cy={head.y - 0.5}
              r="0.28"
              fill="#18181B"
            />

            {/* Lidah Ular Merah Bercabang */}
            <path
              d={tonguePath}
              stroke="#991B1B"
              strokeWidth="0.4"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
      })}
    </g>
  );
}
