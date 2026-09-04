/**
 * AUDIO SYNTHESIZER - GAME ULAR TANGGA TRIVIA
 * Menggunakan Web Audio API untuk efek suara instan tanpa file audio eksternal.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('snakes_ladders_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('snakes_ladders_muted', this.isMuted.toString());
    return this.isMuted;
  }

  // Nada dasar dengan oscillator dan gain envelope
  playTone(freq, type = 'sine', duration = 0.15, startTime = 0, gainVal = 0.2) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  // Suara kocok dadu (klik berulang)
  playDiceRoll() {
    if (this.isMuted) return;
    this.init();
    for (let i = 0; i < 6; i++) {
      const freq = 300 + Math.random() * 200;
      this.playTone(freq, 'triangle', 0.05, i * 0.08, 0.15);
    }
  }

  // Suara langkah pion
  playStep() {
    this.playTone(480, 'sine', 0.08, 0, 0.25);
  }

  // Suara naik tangga (Arpeggio riang C - E - G - C')
  playLadder() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.18, idx * 0.12, 0.25);
    });
  }

  // Suara perosotan ular (turun nada meluncur)
  playSnake() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  // Suara timer kuis berdetik
  playQuizTick() {
    this.playTone(880, 'sine', 0.04, 0, 0.1);
  }

  // Suara kuis benar (Ding-Ding Mayor)
  playCorrect() {
    this.playTone(659.25, 'triangle', 0.15, 0, 0.3); // E5
    this.playTone(1046.50, 'triangle', 0.35, 0.12, 0.35); // C6
  }

  // Suara kuis salah (Buzzer rendah)
  playWrong() {
    this.playTone(220, 'square', 0.2, 0, 0.2); // A3
    this.playTone(196, 'square', 0.3, 0.15, 0.25); // G3
  }

  // Fanfare Kemenangan (Victory melody)
  playVictory() {
    const notes = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 523.25, t: 0.15, d: 0.15 },
      { f: 523.25, t: 0.30, d: 0.15 },
      { f: 659.25, t: 0.45, d: 0.35 },
      { f: 587.33, t: 0.85, d: 0.2 },
      { f: 783.99, t: 1.05, d: 0.6 }
    ];
    notes.forEach(n => {
      this.playTone(n.f, 'triangle', n.d, n.t, 0.3);
    });
  }
}

export const sound = new SoundEngine();
