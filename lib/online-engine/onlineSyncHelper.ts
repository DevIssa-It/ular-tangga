import { Player } from '@/lib/types';
import { soundEngine } from '@/lib/audio';

export async function animateOnlineSteps(
  pIdx: number,
  fromPos: number,
  dice: number,
  finalPos: number,
  playersRef: { current: Player[] },
  setPlayers: (p: Player[]) => void
) {
  let cur = fromPos;
  let forward = true;
  for (let i = 0; i < dice; i++) {
    if (cur >= 100) forward = false;
    cur = forward ? cur + 1 : cur - 1;
    soundEngine.playStep();
    setPlayers(playersRef.current.map((p, idx) => idx === pIdx ? { ...p, position: cur } : p));
    await new Promise((r) => setTimeout(r, 220));
  }
  if (finalPos !== cur) {
    await new Promise((r) => setTimeout(r, 350));
    if (finalPos > cur) soundEngine.playLadder();
    else soundEngine.playSnake();
    setPlayers(playersRef.current.map((p, idx) => idx === pIdx ? { ...p, position: finalPos } : p));
    await new Promise((r) => setTimeout(r, 350));
  }
}
