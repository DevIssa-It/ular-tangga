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

export async function apiTryAutoReconnect(code: string) {
  let sessionData: { playerId?: number; hostId?: string; name?: string; avatar?: string } | null = null;
  try {
    const raw = localStorage.getItem(`ular_session_${code}`);
    if (raw) sessionData = JSON.parse(raw);
  } catch {}
  if (!sessionData || (!sessionData.playerId && !sessionData.name)) return null;

  try {
    const res = await fetch(`/api/rooms/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: sessionData.name || 'Pemain',
        avatar: sessionData.avatar || '🦁',
        playerId: sessionData.playerId,
        hostId: sessionData.hostId,
      }),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

