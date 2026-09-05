import React from 'react';
import { LADDERS, SNAKES } from '@/lib/board-config';
import { getRandomQuiz } from '@/lib/quiz-bank';
import { soundEngine } from '@/lib/audio';
import { Player, QuizQuestion } from '@/lib/types';

export interface TileEvalResult {
  nextPos: number;
  isSpecial: boolean;
  specialType?: 'ladder' | 'snake' | 'quiz';
  quiz?: QuizQuestion;
  isWin: boolean;
  logText?: string;
}

export async function evaluateLandedTile(
  tile: number,
  player: Player,
  quizTiles: number[]
): Promise<TileEvalResult> {
  const ladder = LADDERS.find((l) => l.start === tile);
  if (ladder) {
    soundEngine.playLadder();
    return {
      nextPos: ladder.end,
      isSpecial: true,
      specialType: 'ladder',
      isWin: ladder.end === 100,
      logText: `🪜 ${player.name} naik tangga dari ${ladder.start} ke ${ladder.end}!`,
    };
  }

  const snake = SNAKES.find((s) => s.start === tile);
  if (snake) {
    soundEngine.playSnake();
    return {
      nextPos: snake.end,
      isSpecial: true,
      specialType: 'snake',
      isWin: false,
      logText: `🐍 ${player.name} kena ular di ${snake.start} -> meluncur ke ${snake.end}!`,
    };
  }

  if (quizTiles.includes(tile)) {
    let quiz = getRandomQuiz();
    try {
      const res = await fetch('/api/quiz');
      const data = await res.json();
      if (data.success && data.question) quiz = data.question;
    } catch {}
    return {
      nextPos: tile,
      isSpecial: true,
      specialType: 'quiz',
      quiz,
      isWin: false,
      logText: `❓ ${player.name} di petak Kuis ${tile}! Kategori: ${quiz.category}`,
    };
  }

  return { nextPos: tile, isSpecial: false, isWin: tile === 100 };
}

export async function movePawnStepByStep(
  steps: number,
  playerIdx: number,
  players: Player[],
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
): Promise<number> {
  let cur = players[playerIdx].position;
  let forward = true;
  for (let i = 0; i < steps; i++) {
    if (cur >= 100) forward = false;
    cur = forward ? cur + 1 : cur - 1;
    soundEngine.playStep();
    setPlayers((prev) => {
      const u = [...prev];
      if (u[playerIdx]) u[playerIdx] = { ...u[playerIdx], position: cur };
      return u;
    });
    await new Promise((r) => setTimeout(r, 220));
  }
  return cur;
}

export async function moveQuizSteps(
  playerIdx: number,
  startPos: number,
  isCorrect: boolean,
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
): Promise<number> {
  let targetPos = startPos;
  if (isCorrect) {
    targetPos = Math.min(100, startPos + 2);
    for (let i = 1; i <= 2; i++) {
      soundEngine.playStep();
      setPlayers((prev) => {
        const u = [...prev];
        u[playerIdx].position = Math.min(100, startPos + i);
        return u;
      });
      await new Promise((r) => setTimeout(r, 250));
    }
  } else {
    targetPos = Math.max(1, startPos - 1);
    if (startPos > 1) {
      soundEngine.playStep();
      setPlayers((prev) => {
        const u = [...prev];
        u[playerIdx].position = targetPos;
        return u;
      });
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  return targetPos;
}
