import { QuizQuestion } from '../types';

const CUSTOM_QUIZ_KEY = 'ular_tangga_custom_quizzes_v1';

export function getCustomQuestions(): QuizQuestion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_QUIZ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomQuestion(question: QuizQuestion): void {
  if (typeof window === 'undefined') return;
  const current = getCustomQuestions();
  const updated = [question, ...current.filter((q) => q.id !== question.id)];
  localStorage.setItem(CUSTOM_QUIZ_KEY, JSON.stringify(updated));
}

export function deleteCustomQuestion(id: string): void {
  if (typeof window === 'undefined') return;
  const current = getCustomQuestions();
  const updated = current.filter((q) => q.id !== id);
  localStorage.setItem(CUSTOM_QUIZ_KEY, JSON.stringify(updated));
}
