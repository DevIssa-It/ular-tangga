import React from 'react';
import { LADDERS, SNAKES, getTileCenterPercent } from '@/lib/board-config';

export default function SnakesLaddersSVG() {
  return (
    <svg
      className="board-svg-overlay"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ====================================================================
          TANGGA (LADDERS) - Tampak Otentik: Dua Rel Tegas & Anak Tangga Rapi
          ==================================================================== */}
      <g className="svg-ladders-group">
        {LADDERS.map((ladder, idx) => {
          const p1 = getTileCenterPercent(ladder.start);
          const p2 = getTileCenterPercent(ladder.end);

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len === 0) return null;

          const railSpacing = 1.4;
          const ux = (-dy / len) * railSpacing;
          const uy = (dx / len) * railSpacing;

          const r1x1 = p1.x + ux;
          const r1y1 = p1.y + uy;
          const r1x2 = p2.x + ux;
          const r1y2 = p2.y + uy;

          const r2x1 = p1.x - ux;
          const r2y1 = p1.y - uy;
          const r2x2 = p2.x - ux;
          const r2y2 = p2.y - uy;

          const numRungs = Math.max(4, Math.floor(len / 4.5));
          const rungs = [];

          for (let i = 1; i <= numRungs; i++) {
            const t = i / (numRungs + 1);
            const rx1 = r1x1 + (r1x2 - r1x1) * t;
            const ry1 = r1y1 + (r1y2 - r1y1) * t;
            const rx2 = r2x1 + (r2x2 - r2x1) * t;
            const ry2 = r2y1 + (r2y2 - r2y1) * t;

            rungs.push(
              <line
                key={`rung-${idx}-${i}`}
                x1={rx1}
                y1={ry1}
                x2={rx2}
                y2={ry2}
                stroke="#15803D"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            );
          }

          return (
            <g key={`ladder-${idx}`}>
              {/* Rel Tangga Luar (Border/Shadow) */}
              <line
                x1={r1x1}
                y1={r1y1}
                x2={r1x2}
                y2={r1y2}
                stroke="#14532D"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <line
                x1={r2x1}
                y1={r2y1}
                x2={r2x2}
                y2={r2y2}
                stroke="#14532D"
                strokeWidth="1.2"
                strokeLinecap="round"
              />

              {/* Rel Tangga Dalam (Hijau Solid Terang) */}
              <line
                x1={r1x1}
                y1={r1y1}
                x2={r1x2}
                y2={r1y2}
                stroke="#22C55E"
                strokeWidth="0.7"
                strokeLinecap="round"
              />
              <line
                x1={r2x1}
                y1={r2y1}
                x2={r2x2}
                y2={r2y2}
                stroke="#22C55E"
                strokeWidth="0.7"
                strokeLinecap="round"
              />

              {/* Anak-anak Tangga */}
              {rungs}
            </g>
          );
        })}
      </g>

      {/* ====================================================================
          ULAR (SNAKES) - Ramping, Berliku Anggun, Proporsional
          ==================================================================== */}
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
    </svg>
  );
}
