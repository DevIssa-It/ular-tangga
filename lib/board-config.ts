import { SnakeOrLadder } from './types';

// Daftar Tangga: Naik dari start ke end
export const LADDERS: SnakeOrLadder[] = [
  { start: 4, end: 14 },
  { start: 9, end: 31 },
  { start: 20, end: 38 },
  { start: 28, end: 84 },
  { start: 40, end: 59 },
  { start: 51, end: 67 },
  { start: 63, end: 81 },
  { start: 71, end: 91 },
];

// Daftar Ular: Turun dari start (kepala) ke end (ekor)
export const SNAKES: SnakeOrLadder[] = [
  { start: 17, end: 7 },
  { start: 54, end: 34 },
  { start: 62, end: 19 },
  { start: 64, end: 60 },
  { start: 87, end: 24 },
  { start: 93, end: 73 },
  { start: 95, end: 75 },
  { start: 98, end: 79 },
];

// Petak Kuis Bawaan (Fallback)
export const DEFAULT_QUIZ_TILES: number[] = [6, 12, 25, 36, 46, 58, 66, 76, 89];
export const QUIZ_TILES = new Set<number>(DEFAULT_QUIZ_TILES);

/**
 * Menghasilkan daftar petak kuis secara acak dan proporsional.
 * Memastikan tidak bertabrakan dengan petak Start (1), Goal (100),
 * pangkal/ujung tangga, ataupun kepala/ekor ular.
 */
export function generateRandomQuizTiles(countPerZone: number = 2): number[] {
  const forbidden = new Set<number>([1, 100]);

  // Larang petak awal & akhir tangga
  LADDERS.forEach((l) => {
    forbidden.add(l.start);
    forbidden.add(l.end);
  });

  // Larang petak kepala & ekor ular
  SNAKES.forEach((s) => {
    forbidden.add(s.start);
    forbidden.add(s.end);
  });

  // Bagi papan menjadi 5 zona (1-20, 21-40, 41-60, 61-80, 81-99)
  // agar letak kuis tersebar merata dari bawah ke atas
  const zones = [
    { min: 2, max: 20 },
    { min: 21, max: 40 },
    { min: 41, max: 60 },
    { min: 61, max: 80 },
    { min: 81, max: 99 },
  ];

  const selected: number[] = [];

  zones.forEach((zone) => {
    const candidates: number[] = [];
    for (let t = zone.min; t <= zone.max; t++) {
      if (!forbidden.has(t)) {
        candidates.push(t);
      }
    }

    // Acak kandidat (Fisher-Yates shuffle)
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const takeCount = Math.min(countPerZone, candidates.length);
    selected.push(...candidates.slice(0, takeCount));
  });

  return selected.sort((a, b) => a - b);
}


/**
 * Mengonversi nomor petak (1-100) menjadi koordinat grid (row, col)
 * Row 0 = baris paling atas (91-100), Row 9 = baris paling bawah (1-10)
 * Pola zigzag: Baris genap dari bawah ke kanan (0, 2, 4,...), ganjil ke kiri (1, 3, 5,...)
 */
export function getGridCoordinates(tileNumber: number): { row: number; col: number } {
  const index = Math.max(1, Math.min(100, tileNumber)) - 1;
  const rowFromBottom = Math.floor(index / 10);
  const row = 9 - rowFromBottom;
  const remainder = index % 10;
  const col = rowFromBottom % 2 === 0 ? remainder : 9 - remainder;
  return { row, col };
}

/**
 * Menghitung koordinat persentase pusat petak (0% s.d. 100%)
 * Berguna untuk posisi absolut pion dan jalur SVG
 */
export function getTileCenterPercent(tileNumber: number): { x: number; y: number } {
  const { row, col } = getGridCoordinates(tileNumber);
  // Tiap petak selebar 10%, titik tengahnya col * 10 + 5
  return {
    x: col * 10 + 5,
    y: row * 10 + 5,
  };
}

/**
 * Pilihan warna solid bawaan untuk hingga 6 pemain
 */
export const DEFAULT_PLAYER_PRESETS = [
  { name: 'Pemain 1', color: '#DC2626', avatar: '🦁' }, // Merah Solid
  { name: 'Pemain 2', color: '#2563EB', avatar: '🦅' }, // Biru Solid
  { name: 'Pemain 3', color: '#16A34A', avatar: '🐸' }, // Hijau Solid
  { name: 'Pemain 4', color: '#D97706', avatar: '🦊' }, // Kuning Amber Solid
  { name: 'Pemain 5', color: '#9333EA', avatar: '🐙' }, // Ungu Solid
  { name: 'Pemain 6', color: '#0D9488', avatar: '🐬' }, // Teal Solid
];
