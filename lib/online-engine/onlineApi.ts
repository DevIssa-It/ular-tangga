export async function apiRollDice(code: string, playerId: number) {
  const res = await fetch(`/api/rooms/${code}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'ROLL_DICE', playerId }),
  });
  return res.ok ? await res.json() : null;
}

export async function apiAnswerQuiz(code: string, playerId: number, isCorrect: boolean) {
  const res = await fetch(`/api/rooms/${code}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'ANSWER_QUIZ', playerId, isCorrect }),
  });
  return res.ok ? await res.json() : null;
}

export async function apiSendTaunt(code: string, playerId: number, text: string) {
  const res = await fetch(`/api/rooms/${code}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'SEND_TAUNT', playerId, text }),
  });
  return res.ok ? await res.json() : null;
}

export async function apiLeaveRoom(code: string, playerId: number, hostId?: string) {
  try {
    await fetch(`/api/rooms/${code}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, hostId }),
    });
  } catch {}
}
