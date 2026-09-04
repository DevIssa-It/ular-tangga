import { NextResponse } from 'next/server';
import {
  getAllQuizQuestionsFromDb,
  getRandomQuizFromDb,
  saveQuizQuestionToDb,
  deleteQuizQuestionFromDb,
  seedQuestionsIfEmpty,
} from '@/lib/db';
import { QuizQuestion } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count') || '1', 10);
  const category = searchParams.get('category') || undefined;
  const isAll = searchParams.get('all') === 'true' || searchParams.get('list') === 'true';

  try {
    // Pastikan database terisi soal bawaan jika belum ada
    await seedQuestionsIfEmpty();

    // 1. Permintaan seluruh daftar soal (digunakan oleh Admin Dashboard)
    if (isAll) {
      const questions = await getAllQuizQuestionsFromDb(category);
      return NextResponse.json({
        success: true,
        questions,
        total: questions.length,
      });
    }

    // 2. Permintaan 1 soal acak (fase kuis dalam game)
    if (count === 1) {
      const question = await getRandomQuizFromDb();
      return NextResponse.json({ success: true, question });
    }

    // 3. Permintaan multiple soal acak
    const all = await getAllQuizQuestionsFromDb(category);
    const shuffled = [...all].sort(() => 0.5 - Math.random());
    return NextResponse.json({
      success: true,
      questions: shuffled.slice(0, Math.min(count, all.length)),
      total: all.length,
    });
  } catch (err: any) {
    console.error('[API Quiz] Error GET:', err);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil soal kuis' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // A. Batch / Import Multiple Questions
    if (Array.isArray(body.questions)) {
      const questions: QuizQuestion[] = body.questions;
      let inserted = 0;
      for (const q of questions) {
        const item: QuizQuestion = {
          ...q,
          id: q.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          isCustom: true,
        };
        const ok = await saveQuizQuestionToDb(item);
        if (ok) inserted++;
      }
      return NextResponse.json({ success: true, count: inserted });
    }

    // B. Single Question
    const q: QuizQuestion = {
      id: body.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      category: body.category,
      question: body.question,
      options: body.options,
      correctIndex: body.correctIndex,
      explanation: body.explanation || '',
      isCustom: true,
    };

    const ok = await saveQuizQuestionToDb(q);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Gagal menyimpan ke database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, question: q });
  } catch (err: any) {
    console.error('[API Quiz] Error POST:', err);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID soal wajib disertakan' }, { status: 400 });
    }

    const ok = await deleteQuizQuestionFromDb(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Gagal menghapus soal dari database' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API Quiz] Error DELETE:', err);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
