import { getDatabase } from './db';
import { QuizQuestion } from './types';
import { QUIZ_QUESTIONS } from './quiz-bank';

let quizTableInitialized = false;

export async function initQuizTable() {
  if (quizTableInitialized) return;
  const sql = getDatabase();
  if (!sql) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id VARCHAR(64) PRIMARY KEY,
        category VARCHAR(64) NOT NULL,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_index INTEGER NOT NULL,
        explanation TEXT,
        is_custom BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    quizTableInitialized = true;
    await seedQuestionsIfEmpty();
  } catch (err) {
    console.warn('[Neon DB] Warning init quiz table:', err);
  }
}

export async function seedQuestionsIfEmpty() {
  const sql = getDatabase();
  if (!sql) return;

  try {
    const rows = await sql`SELECT COUNT(*)::int as count FROM quiz_questions;`;
    const count = rows[0]?.count ?? 0;
    if (count === 0) {
      console.log(`[Neon DB] Seeding ${QUIZ_QUESTIONS.length} bank soal bawaan...`);
      for (const q of QUIZ_QUESTIONS) {
        await sql`
          INSERT INTO quiz_questions (id, category, question, options, correct_index, explanation, is_custom)
          VALUES (${q.id}, ${q.category}, ${q.question}, ${JSON.stringify(q.options)}::jsonb, ${q.correctIndex}, ${q.explanation}, FALSE)
          ON CONFLICT (id) DO NOTHING;
        `;
      }
      console.log('[Neon DB] Berhasil seeding 50+ bank soal ke database!');
    }
  } catch (err) {
    console.warn('[Neon DB] Error saat seeding bank soal:', err);
  }
}

export async function getAllQuizQuestionsFromDb(category?: string): Promise<QuizQuestion[]> {
  const sql = getDatabase();
  if (!sql) return QUIZ_QUESTIONS;

  try {
    await initQuizTable();
    const rows = category && category !== 'SEMUA'
      ? await sql`SELECT * FROM quiz_questions WHERE category = ${category} ORDER BY created_at DESC;`
      : await sql`SELECT * FROM quiz_questions ORDER BY created_at DESC;`;

    return rows.map((r: any) => ({
      id: r.id,
      category: r.category,
      question: r.question,
      options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options,
      correctIndex: r.correct_index,
      explanation: r.explanation || '',
      isCustom: Boolean(r.is_custom),
    }));
  } catch (err) {
    console.warn('[Neon DB] Fallback ke soal statis:', err);
    return QUIZ_QUESTIONS;
  }
}

export async function getRandomQuizFromDb(excludedIds: string[] = []): Promise<QuizQuestion> {
  const sql = getDatabase();
  if (!sql) {
    const pool = QUIZ_QUESTIONS.filter((q) => !excludedIds.includes(q.id));
    return (pool.length > 0 ? pool : QUIZ_QUESTIONS)[Math.floor(Math.random() * (pool.length || QUIZ_QUESTIONS.length))];
  }

  try {
    await initQuizTable();
    const rows = excludedIds.length > 0
      ? await sql`SELECT * FROM quiz_questions WHERE id != ALL(${excludedIds}) ORDER BY RANDOM() LIMIT 1;`
      : await sql`SELECT * FROM quiz_questions ORDER BY RANDOM() LIMIT 1;`;

    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        id: r.id,
        category: r.category,
        question: r.question,
        options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options,
        correctIndex: r.correct_index,
        explanation: r.explanation || '',
        isCustom: Boolean(r.is_custom),
      };
    }
  } catch (err) {
    console.warn('[Neon DB] Error getRandomQuizFromDb, fallback:', err);
  }

  return QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
}

export async function saveQuizQuestionToDb(q: QuizQuestion): Promise<boolean> {
  const sql = getDatabase();
  if (!sql) return false;

  try {
    await initQuizTable();
    await sql`
      INSERT INTO quiz_questions (id, category, question, options, correct_index, explanation, is_custom)
      VALUES (
        ${q.id},
        ${q.category},
        ${q.question},
        ${JSON.stringify(q.options)}::jsonb,
        ${q.correctIndex},
        ${q.explanation},
        ${q.isCustom ?? true}
      )
      ON CONFLICT (id) DO UPDATE
      SET category = EXCLUDED.category,
          question = EXCLUDED.question,
          options = EXCLUDED.options,
          correct_index = EXCLUDED.correct_index,
          explanation = EXCLUDED.explanation,
          is_custom = EXCLUDED.is_custom;
    `;
    return true;
  } catch (err) {
    console.error('[Neon DB] Error saveQuizQuestionToDb:', err);
    return false;
  }
}

export async function deleteQuizQuestionFromDb(id: string): Promise<boolean> {
  const sql = getDatabase();
  if (!sql) return false;

  try {
    await initQuizTable();
    await sql`DELETE FROM quiz_questions WHERE id = ${id};`;
    return true;
  } catch (err) {
    console.error('[Neon DB] Error deleteQuizQuestionFromDb:', err);
    return false;
  }
}
