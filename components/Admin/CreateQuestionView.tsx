'use client';

import React, { useState } from 'react';
import { QuizCategory, QuizQuestion } from '@/lib/types';

interface CreateQuestionViewProps {
  onSaveQuestion: (q: Omit<QuizQuestion, 'id'>) => void;
}

export default function CreateQuestionView({ onSaveQuestion }: CreateQuestionViewProps) {
  const [category, setCategory] = useState<QuizCategory>('Umum');
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState('');

  const optionsList = [
    { label: 'A', val: optionA, set: setOptionA, idx: 0 },
    { label: 'B', val: optionB, set: setOptionB, idx: 1 },
    { label: 'C', val: optionC, set: setOptionC, idx: 2 },
    { label: 'D', val: optionD, set: setOptionD, idx: 3 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !optionA.trim() || !optionB.trim()) return;

    onSaveQuestion({
      category,
      question: questionText.trim(),
      options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
      correctIndex,
      explanation: explanation.trim() || 'Jawaban telah diverifikasi.',
    });

    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setExplanation('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '6px' }}>
          KATEGORI SOAL
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as QuizCategory)}
          className="player-input"
          style={{ width: '100%', boxSizing: 'border-box' }}
        >
          <option value="Umum">Umum</option>
          <option value="Sains">Sains</option>
          <option value="Logika">Logika</option>
          <option value="Budaya">Budaya</option>
        </select>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '6px' }}>
          PERTANYAAN
        </label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Tuliskan pertanyaan kuis di sini..."
          rows={3}
          required
          className="player-input"
          style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '6px' }}>
          PILIHAN JAWABAN (PILIH LINGKARAN RADIO UNTUK KUNCI JAWABAN)
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {optionsList.map((item) => {
            const isChecked = correctIndex === item.idx;
            return (
              <div
                key={item.label}
                className={`quiz-option-row ${isChecked ? 'is-correct' : ''}`}
              >
                <input
                  type="radio"
                  name="correctChoice"
                  checked={isChecked}
                  onChange={() => setCorrectIndex(item.idx)}
                  title={`Pilih opsi ${item.label} sebagai kunci jawaban`}
                />
                <span style={{ fontWeight: 800, width: '22px', fontSize: '0.95rem' }}>{item.label}.</span>
                <input
                  type="text"
                  value={item.val}
                  onChange={(e) => item.set(e.target.value)}
                  placeholder={`Tulis isi pilihan ${item.label}...`}
                  required
                  className="player-input"
                  style={{ flex: 1, padding: '8px 12px', boxSizing: 'border-box' }}
                />
                {isChecked && (
                  <span className="quiz-option-badge">
                    ✓ Kunci
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '6px' }}>
          PENJELASAN / PEMBAHASAN EDUKATIF
        </label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Penjelasan edukasi setelah pemain menjawab..."
          rows={2}
          className="player-input"
          style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
      >
        💾 Simpan Soal ke Bank Kuis
      </button>
    </form>
  );
}
