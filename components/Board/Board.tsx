'use client';

import React from 'react';
import Tile from './Tile';
import SnakesLaddersSVG from './SnakesLaddersSVG';
import { Player } from '@/lib/types';
import { getTileCenterPercent, getGridCoordinates } from '@/lib/board-config';

interface BoardProps {
  players: Player[];
  activePlayerIndex: number;
  quizTiles?: number[];
}

export default function Board({ players, activePlayerIndex, quizTiles }: BoardProps) {
  const quizTileSet = React.useMemo(() => {
    return quizTiles ? new Set(quizTiles) : undefined;
  }, [quizTiles]);
  // Susun nomor petak dari 100 hingga 1 sesuai urutan render CSS Grid (baris atas ke bawah, kiri ke kanan)
  // Row 0 (atas): petak 91 s.d 100 jika genap dari bawah
  // Kita buat pemetaan 100 cell berdasar row (0..9) dan col (0..9)
  const gridTiles: number[] = [];
  for (let row = 0; row < 10; row++) {
    const rowFromBottom = 9 - row;
    for (let col = 0; col < 10; col++) {
      // Jika rowFromBottom genap: col 0 = 1, col 9 = 10
      // Jika rowFromBottom ganjil: col 0 = 20, col 9 = 11
      const colIndex = rowFromBottom % 2 === 0 ? col : 9 - col;
      const tileNumber = rowFromBottom * 10 + colIndex + 1;
      gridTiles.push(tileNumber);
    }
  }

  // Hitung offset bagi pemain yang berada di petak yang sama
  const getPawnPosition = (player: Player, index: number) => {
    const baseCenter = getTileCenterPercent(player.position);
    // Cari berapa pemain lain di petak yang sama
    const sameTilePlayers = players.filter((p) => p.position === player.position);
    if (sameTilePlayers.length <= 1) {
      return { left: `${baseCenter.x}%`, top: `${baseCenter.y}%` };
    }

    // Beri sedikit offset sudut jika menumpuk di petak yang sama
    const playerRankInTile = sameTilePlayers.findIndex((p) => p.id === player.id);
    const angle = (playerRankInTile * (2 * Math.PI)) / sameTilePlayers.length;
    const offsetDistance = 2.2; // persen offset
    const offsetX = Math.cos(angle) * offsetDistance;
    const offsetY = Math.sin(angle) * offsetDistance;

    return {
      left: `${baseCenter.x + offsetX}%`,
      top: `${baseCenter.y + offsetY}%`,
    };
  };

  return (
    <div className="board-container">
      {/* Grid 10x10 Petak */}
      <div className="board-grid">
        {gridTiles.map((tileNum) => (
          <Tile
            key={`tile-${tileNum}`}
            tileNumber={tileNum}
            isQuiz={quizTileSet ? quizTileSet.has(tileNum) : undefined}
          />
        ))}
      </div>

      {/* SVG Ular & Tangga */}
      <SnakesLaddersSVG />

      {/* Layer Bidak Pion Pemain */}
      <div className="board-pawns-layer">
        {players.map((player, idx) => {
          const pos = getPawnPosition(player, idx);
          const isActive = idx === activePlayerIndex;

          return (
            <div
              key={`pawn-${player.id}`}
              className={`player-pawn ${isActive ? 'is-active' : ''}`}
              style={{
                left: pos.left,
                top: pos.top,
                backgroundColor: player.color,
              }}
              title={`${player.name} (Petak ${player.position})`}
            >
              {isActive && <div className="player-pawn-indicator" />}
              <span>{player.avatar}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
