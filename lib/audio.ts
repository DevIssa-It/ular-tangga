/**
 * AUDIO SYNTHESIZER - WEB AUDIO API (Procedural Sound Engine)
 * Menghasilkan efek suara real-time tanpa memerlukan aset mp3 eksternal.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.muted = localStorage.getItem('snakes_ladders_muted') === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('snakes_ladders_muted', this.muted.toString());
    }
    return this.muted;
  }

  private playTone(freq: number, type: OscillatorType = 'sine', duration = 0.15, startTime = 0, gainVal = 0.2): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    } catch {
      // Ignore audio failure
    }
  }

  // Suara kocokan dadu
  public playDiceRoll(): void {
    if (this.muted) return;
    for (let i = 0; i < 6; i++) {
      const freq = 300 + Math.random() * 220;
      this.playTone(freq, 'triangle', 0.05, i * 0.07, 0.15);
    }
  }

  // Suara langkah pion
  public playStep(): void {
    this.playTone(480, 'sine', 0.07, 0, 0.2);
  }

  // Suara naik tangga (Arpeggio riang C5 -> E5 -> G5 -> C6)
  public playLadder(): void {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.16, idx * 0.1, 0.22);
    });
  }

  // Suara meluncur ular (Pitch bend turun melengkung)
  public playSnake(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.55);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    } catch {
      // Ignore audio error
    }
  }

  // Suara timer kuis berdetak
  public playQuizTick(): void {
    this.playTone(920, 'sine', 0.03, 0, 0.08);
  }

  // Suara kuis benar (Harmoni ganda cerah)
  public playCorrect(): void {
    this.playTone(659.25, 'triangle', 0.15, 0, 0.25);
    this.playTone(1046.50, 'triangle', 0.32, 0.1, 0.3);
  }

  // Suara kuis salah (Buzzer minor)
  public playWrong(): void {
    this.playTone(220, 'square', 0.18, 0, 0.18);
    this.playTone(196, 'square', 0.28, 0.12, 0.22);
  }

  // Fanfare kemenangan
  public playVictory(): void {
    const notes = [
      { f: 523.25, t: 0, d: 0.12 },
      { f: 523.25, t: 0.13, d: 0.12 },
      { f: 523.25, t: 0.26, d: 0.12 },
      { f: 659.25, t: 0.39, d: 0.3 },
      { f: 587.33, t: 0.72, d: 0.18 },
      { f: 783.99, t: 0.92, d: 0.6 },
    ];
    notes.forEach((n) => {
      this.playTone(n.f, 'triangle', n.d, n.t, 0.25);
    });
  }

  // Suara nada notifikasi giliran
  public playTurnNotification(): void {
    if (this.muted) return;
    this.playTone(523.25, 'triangle', 0.12, 0, 0.22);
    this.playTone(783.99, 'triangle', 0.24, 0.1, 0.25);
  }

  // Suara efek balon taunt / chat pop
  public playTaunt(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  // Pemberitahuan giliran pemain (cukup nada lonceng halus, tanpa suara vokal robotik)
  public playTurnVoice(playerName?: string, isMe?: boolean): void {
    if (this.muted) return;
    this.playTurnNotification();

    // Hentikan antrean speech synthesis jika ada yang berjalan
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const soundEngine = new SoundEngine();
