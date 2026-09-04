import { NextResponse } from 'next/server';
import { QUIZ_QUESTIONS, getRandomQuiz } from '@/lib/quiz-bank';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count') || '1', 10);
  const category = searchParams.get('category');

  let pool = QUIZ_QUESTIONS;
  if (category) {
    pool = pool.filter((q) => q.category.toLowerCase() === category.toLowerCase());
  }

  if (count === 1) {
    const question = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : getRandomQuiz();
    return NextResponse.json({ question });
  }

  // Shuffle and slice
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return NextResponse.json({
    questions: shuffled.slice(0, Math.min(count, pool.length)),
    total: pool.length,
  });
}
