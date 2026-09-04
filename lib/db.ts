import { neon } from '@neondatabase/serverless';
import { OnlineRoomState } from './types';

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
function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes('ep-sample-pooler')) {
    return null;
  }
  return neon(connectionString);
}

// Inisialisasi tabel game_rooms otomatis di Neon DB
let tableInitialized = false;
export async function initDbTable() {
  if (tableInitialized) return;
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
    tableInitialized = true;
  } catch (err) {
    console.warn('[Neon DB] Warning saat inisialisasi tabel:', err);
  }
}

// Menyimpan atau memperbarui room
export async function saveRoom(room: OnlineRoomState): Promise<void> {
  const sql = getDatabase();
  if (!sql) {
    // Gunakan in-memory store
    memoryRooms.set(room.code.toUpperCase(), room);
    return;
  }

  await initDbTable();
  const roomStateJson = JSON.stringify(room);

  await sql`
    INSERT INTO game_rooms (code, host_id, state, updated_at)
    VALUES (${room.code.toUpperCase()}, ${room.hostId}, ${roomStateJson}::jsonb, NOW())
    ON CONFLICT (code) DO UPDATE
    SET state = ${roomStateJson}::jsonb, updated_at = NOW();
  `;
}

// Mengambil data room berdasarkan kode
export async function getRoom(code: string): Promise<OnlineRoomState | null> {
  const normalizedCode = code.trim().toUpperCase();
  const sql = getDatabase();
  if (!sql) {
    return memoryRooms.get(normalizedCode) || null;
  }

  await initDbTable();
  const rows = await sql`
    SELECT state FROM game_rooms WHERE code = ${normalizedCode} LIMIT 1;
  `;

  if (rows && rows.length > 0) {
    const data = rows[0].state;
    return typeof data === 'string' ? JSON.parse(data) : data;
  }

  return null;
}

// Menghapus room (opsional)
export async function deleteRoom(code: string): Promise<void> {
  const normalizedCode = code.trim().toUpperCase();
  const sql = getDatabase();
  if (!sql) {
    memoryRooms.delete(normalizedCode);
    return;
  }

  await initDbTable();
  await sql`
    DELETE FROM game_rooms WHERE code = ${normalizedCode};
  `;
}
