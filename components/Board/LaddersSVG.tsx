import React from 'react';
import { LADDERS, getTileCenterPercent } from '@/lib/board-config';

export default function LaddersSVG() {
  return (
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
  );
}
