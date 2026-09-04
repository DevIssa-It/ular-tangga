export type TileType = 'normal' | 'ladder' | 'snake' | 'quiz' | 'start' | 'finish';

export interface SnakeOrLadder {
  start: number; // Petak asal
  end: number;   // Petak tujuan (bila tangga: end > start, bila ular: end < start)
}

export interface Player {
  id: number;
  name: string;
  color: string;
  avatar: string;
  position: number; // 1 s.d. 100
  previousPosition: number;
  quizzesAnswered: number;
  quizzesCorrect: number;
  laddersClimbed: number;
  snakesBitten: number;
  turnsTaken: number;
  isHost?: boolean;
}

export type QuizCategory = 'Umum' | 'Sains' | 'Logika' | 'Budaya';

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type GamePhase = 
  | 'SETUP'          // Konfigurasi pemain
  | 'WAIT_ROLL'      // Menunggu pemain aktif melempar dadu
  | 'ROLLING'        // Animasi dadu sedang berputar
  | 'MOVING'         // Pion sedang bergerak per petak
  | 'ON_SPECIAL'     // Menangani tangga / ular
  | 'QUIZ_ACTIVE'    // Modal kuis aktif
  | 'QUIZ_RESULT'    // Menampilkan hasil kuis & reward/penalty
  | 'GAME_OVER';     // Ada pemain yang mencapai petak 100

export interface GameLogEntry {
  id: string;
  text: string;
  type: 'info' | 'ladder' | 'snake' | 'quiz' | 'win';
  timestamp: string | Date;
}

export type PlayMode = 'LOCAL' | 'ONLINE';

export interface OnlineRoomState {
  code: string;
  hostId: string;
  status: 'LOBBY' | 'PLAYING' | 'FINISHED';
  players: Player[];
  activePlayerIndex: number;
  diceValue: number;
  phase: GamePhase;
  currentQuiz: QuizQuestion | null;
  winner: Player | null;
  logs: GameLogEntry[];
  consecutiveSixes: number;
  lastRolledSix: boolean;
  version: number;
  updatedAt: number;
  quizTiles: number[];
}
