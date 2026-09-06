import { neon } from '@neondatabase/serverless';
import { OnlineRoomState } from './types';
import { initQuizTable } from './db-quiz';
import { initHistoryTable } from './db-history';

// Re-export quiz & history database methods
export * from './db-quiz';
export * from './db-history';

// Singleton in-memory fallback untuk pengujian lokal saat DATABASE_URL belum diatur
const globalForRooms = globalThis as unknown as {
  memoryRooms?: Map<string, OnlineRoomState>;
};

export const memoryRooms =
  globalForRooms.memoryRooms || new Map<string, OnlineRoomState>();

if (process.env.NODE_ENV !== 'production') {
  globalForRooms.memoryRooms = memoryRooms;
}

// Helper inisialisasi koneksi Neon DB
export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes('ep-sample-pooler')) {
    return null;
  }
  return neon(connectionString);
}

// Inisialisasi tabel game_rooms otomatis di Neon DB
let roomsTableInitialized = false;
export async function initRoomsTable() {
  if (roomsTableInitialized) return;
  const sql = getDatabase();
  if (!sql) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS game_rooms (
        code VARCHAR(12) PRIMARY KEY,
        host_id VARCHAR(64) NOT NULL,
        state JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    roomsTableInitialized = true;
  } catch (err) {
    console.warn('[Neon DB] Warning saat inisialisasi tabel game_rooms:', err);
  }
}

// Inisialisasi semua tabel di Neon DB
export async function initDbTable() {
  await Promise.all([initRoomsTable(), initQuizTable(), initHistoryTable()]);
}

// Menyimpan atau memperbarui room
export async function saveRoom(room: OnlineRoomState): Promise<void> {
  const code = room.code.toUpperCase();
  const sql = getDatabase();
  const existing = memoryRooms.get(code);
  if (existing && existing.version > room.version) return;
  memoryRooms.set(code, room);
  if (!sql) return;

  await initRoomsTable();
  const roomStateJson = JSON.stringify(room);

  await sql`
    INSERT INTO game_rooms (code, host_id, state, updated_at)
    VALUES (${code}, ${room.hostId}, ${roomStateJson}::jsonb, NOW())
    ON CONFLICT (code) DO UPDATE
    SET state = ${roomStateJson}::jsonb, updated_at = NOW()
    WHERE (game_rooms.state->>'version')::int <= ${room.version};
  `;
}

// Mengambil data room berdasarkan kode
export async function getRoom(code: string): Promise<OnlineRoomState | null> {
  const normalizedCode = code.trim().toUpperCase();
  const sql = getDatabase();
  if (!sql) return memoryRooms.get(normalizedCode) || null;

  try {
    await initRoomsTable();
    const rows = await sql`
      SELECT state FROM game_rooms WHERE code = ${normalizedCode} LIMIT 1;
    `;
    if (rows && rows.length > 0) {
      const data = rows[0].state;
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const mem = memoryRooms.get(normalizedCode);
      if (mem && mem.version > (parsed?.version ?? 0)) return mem;
      if (parsed) memoryRooms.set(normalizedCode, parsed);
      return parsed;
    }
  } catch {}
  return memoryRooms.get(normalizedCode) || null;
}

// Menghapus room (opsional)
export async function deleteRoom(code: string): Promise<void> {
  const normalizedCode = code.trim().toUpperCase();
  const sql = getDatabase();
  if (!sql) {
    memoryRooms.delete(normalizedCode);
    return;
  }

  await initRoomsTable();
  await sql`
    DELETE FROM game_rooms WHERE code = ${normalizedCode};
  `;
}
