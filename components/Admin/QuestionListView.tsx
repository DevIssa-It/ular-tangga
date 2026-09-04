'use client';

import React, { useState } from 'react';
import { QuizQuestion } from '@/lib/types';

interface QuestionListViewProps {
  questions: (QuizQuestion & { isCustom?: boolean })[];
  customCount: number;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onDelete: (id: string) => void;
}

export default function QuestionListView({
  questions,
  customCount,
  selectedCategory,
  setSelectedCategory,
  onDelete,
}: QuestionListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const categories = ['SEMUA', 'KUSTOM', 'Umum', 'Sains', 'Logika', 'Budaya'];

  const displayedQuestions = questions.filter((q) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.question.toLowerCase().includes(query) ||
      q.category.toLowerCase().includes(query) ||
      q.options.some((opt) => opt.toLowerCase().includes(query))
    );
  });

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* Input Pencarian Soal */}
      <div style={{ marginBottom: '14px' }}>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Cari pertanyaan atau kata kunci..."
          className="player-input"
          style={{ width: '100%' }}
        />
      </div>

      {/* Filter Kategori */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: '2px solid var(--border-color)',
              borderRadius: '6px',
              backgroundColor: selectedCategory === cat ? 'var(--color-ink)' : 'var(--color-surface)',
              color: selectedCategory === cat ? '#FFFFFF' : 'var(--color-ink)',
              cursor: 'pointer',
              boxShadow: selectedCategory === cat ? '2px 2px 0px var(--border-color)' : 'none',
            }}
          >
            {cat} {cat === 'KUSTOM' ? `(${customCount})` : ''}
          </button>
        ))}
      </div>

      {/* List Soal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayedQuestions.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '2px dashed var(--border-color)',
              borderRadius: '8px',
              color: 'var(--color-ink-muted)',
              fontWeight: 700,
            }}
          >
            {searchQuery ? `Tidak ada soal yang cocok dengan kata "${searchQuery}".` : 'Tidak ada soal untuk kategori ini.'}
          </div>
        ) : (
          displayedQuestions.map((q, idx) => (
            <div
              key={q.id}
              style={{
                padding: '14px',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.88rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span
                    style={{
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary-dark)',
                      border: '1.5px solid var(--color-primary)',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}
                  >
                    {q.category}
                  </span>
                  {q.isCustom && (
                    <span
                      style={{
                        backgroundColor: '#FEF08A',
                        border: '1.5px solid #D97706',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#92400E',
                      }}
                    >
                      ⭐ Kustom
                    </span>
                  )}
                </div>
                {q.isCustom && (
                  <button
                    type="button"
                    onClick={() => onDelete(q.id)}
                    className="btn btn-sm"
                    style={{
                      borderColor: 'var(--color-danger)',
                      color: 'var(--color-danger)',
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                    }}
                  >
                    🗑️ Hapus
                  </button>
                )}
              </div>

              <div style={{ fontWeight: 800, marginBottom: '8px', fontSize: '0.94rem' }}>
                {idx + 1}. {q.question}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.82rem' }}>
                {q.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: optIdx === q.correctIndex ? '2px solid var(--color-success)' : '1.5px solid #CBD5E1',
                      backgroundColor: optIdx === q.correctIndex ? 'var(--color-success-light)' : '#FFFFFF',
                      fontWeight: optIdx === q.correctIndex ? 800 : 500,
                      color: optIdx === q.correctIndex ? '#166534' : 'inherit',
                    }}
                  >
                    {['A', 'B', 'C', 'D'][optIdx]}. {opt} {optIdx === q.correctIndex && '✓ (Kunci)'}
                  </div>
                ))}
              </div>

              {q.explanation && (
                <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>
                  💡 <em>{q.explanation}</em>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
