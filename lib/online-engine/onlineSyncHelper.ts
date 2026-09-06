import React from 'react';
import { Player } from '@/lib/types';
import { soundEngine } from '@/lib/audio';
import { LADDERS, SNAKES } from '@/lib/board-config';

export async function animateOnlineSteps(
  pIdx: number,
  fromPos: number,
  dice: number,
  finalPos: number,
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
) {
  if (fromPos === finalPos) return;

  // Hitung posisi yang diharapkan jika ini adalah lemparan dadu
  let expectedDicePos = fromPos;
  let forward = true;
  for (let i = 0; i < dice; i++) {
    if (expectedDicePos >= 100) forward = false;
    expectedDicePos = forward ? expectedDicePos + 1 : expectedDicePos - 1;
  }

  const ladder = LADDERS.find((l) => l.start === expectedDicePos);
  const snake = SNAKES.find((s) => s.start === expectedDicePos);

  const isDiceMove =
    finalPos === expectedDicePos ||
    (ladder && finalPos === ladder.end) ||
    (snake && finalPos === snake.end);

  if (isDiceMove && dice >= 1 && dice <= 6) {
    // Animasi melangkah sekuensial sesuai dadu
    let cur = fromPos;
    let fwd = true;
    for (let i = 0; i < dice; i++) {
      if (cur >= 100) fwd = false;
      cur = fwd ? cur + 1 : cur - 1;
      soundEngine.playStep();
      setPlayers((prev) => prev.map((p, idx) => (idx === pIdx ? { ...p, position: cur } : p)));
      await new Promise((r) => setTimeout(r, 220));
    }

    // Jika mendarat di tangga atau ular
    if (finalPos !== cur) {
      await new Promise((r) => setTimeout(r, 350));
      if (finalPos > cur) soundEngine.playLadder();
      else soundEngine.playSnake();
      setPlayers((prev) => prev.map((p, idx) => (idx === pIdx ? { ...p, position: finalPos } : p)));
      await new Promise((r) => setTimeout(r, 350));
    }
  } else {
    // Penanganan khusus aksi non-dadu (jawaban kuis +2 atau -1, atau teleport tangga/ular)
    const diff = finalPos - fromPos;
    if (diff === 2) {
      for (let s = 1; s <= 2; s++) {
        soundEngine.playStep();
        setPlayers((prev) => prev.map((p, idx) => (idx === pIdx ? { ...p, position: Math.min(100, fromPos + s) } : p)));
        await new Promise((r) => setTimeout(r, 220));
      }
    } else if (diff === -1) {
      soundEngine.playStep();
      setPlayers((prev) => prev.map((p, idx) => (idx === pIdx ? { ...p, position: Math.max(1, fromPos - 1) } : p)));
      await new Promise((r) => setTimeout(r, 220));
    } else {
      if (finalPos > fromPos) soundEngine.playLadder();
      else soundEngine.playSnake();
      setPlayers((prev) => prev.map((p, idx) => (idx === pIdx ? { ...p, position: finalPos } : p)));
      await new Promise((r) => setTimeout(r, 300));
    }
  }
}
