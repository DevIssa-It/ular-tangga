import { QuizQuestion } from './types';
import { DEFAULT_QUIZ_QUESTIONS } from './quiz-data/defaultQuestions';
import { getCustomQuestions, saveCustomQuestion, deleteCustomQuestion } from './quiz-data/customStorage';

export { getCustomQuestions, saveCustomQuestion, deleteCustomQuestion };
export const QUIZ_QUESTIONS: QuizQuestion[] = DEFAULT_QUIZ_QUESTIONS;

/**
 * Mengambil seluruh bank soal (Bawaan + Kustom pengguna)
 */
export function getAllQuestions(): QuizQuestion[] {
  const custom = getCustomQuestions();
  return [...custom, ...QUIZ_QUESTIONS];
}

/**
 * Mengambil pertanyaan kuis acak (Mencakup soal kustom pengguna)
 */
export function getRandomQuiz(excludedIds: string[] = []): QuizQuestion {
  const all = getAllQuestions();
  const pool = all.filter((q) => !excludedIds.includes(q.id));
  const activePool = pool.length > 0 ? pool : all;
  const randomIndex = Math.floor(Math.random() * activePool.length);
  return activePool[randomIndex];
}
