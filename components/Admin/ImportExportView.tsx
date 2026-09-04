'use client';

import React, { useState } from 'react';
import { QuizQuestion } from '@/lib/types';

interface ImportExportViewProps {
  questionsToExport: QuizQuestion[];
  onImportQuestions: (questions: QuizQuestion[]) => void;
}

export default function ImportExportView({
  questionsToExport,
  onImportQuestions,
}: ImportExportViewProps) {
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  const jsonPlaceholder = `[\n  {\n    "category": "Sains",\n    "question": "Apa nama rumus air?",\n    "options": ["H2O", "CO2", "NaCl", "O2"],\n    "correctIndex": 0,\n    "explanation": "H2O adalah rumus kimia molekul air."\n  }\n]`;

  const handleExportJson = () => {
    const data = JSON.stringify(questionsToExport, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-soal-ular-tangga-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Format JSON harus berupa Array soal [ { ... } ].');
      }

      const importedList: QuizQuestion[] = [];
      parsed.forEach((item, idx) => {
        if (item.question && Array.isArray(item.options) && item.options.length >= 2) {
          importedList.push({
            id: `custom-imp-${Date.now()}-${idx}`,
            category: item.category || 'Umum',
            question: String(item.question),
            options: item.options.map(String),
            correctIndex: typeof item.correctIndex === 'number' ? item.correctIndex : 0,
            explanation: item.explanation ? String(item.explanation) : 'Kuis Kustom',
          });
        }
      });

      if (importedList.length === 0) {
        throw new Error('Tidak ada soal valid yang ditemukan dalam JSON.');
      }

      onImportQuestions(importedList);
      setImportJsonText('');
    } catch (err: unknown) {
      setImportError((err as Error).message || 'Gagal memproses JSON.');
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div
        style={{
          marginBottom: '20px',
          padding: '18px',
          backgroundColor: 'var(--color-surface-subtle)',
          border: '2px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '2px 2px 0px var(--border-color)',
        }}
      >
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px 0' }}>
          📤 Ekspor Bank Soal
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', marginBottom: '12px', fontWeight: 600 }}>
          Unduh seluruh bank soal ({questionsToExport.length} soal) dalam format JSON untuk cadangan.
        </p>
        <button
          type="button"
          onClick={handleExportJson}
          className="btn btn-sm"
          style={{ justifyContent: 'center' }}
        >
          📥 Unduh File JSON Bank Soal
        </button>
      </div>

      <form
        onSubmit={handleImportJson}
        style={{
          padding: '18px',
          backgroundColor: 'var(--color-surface-subtle)',
          border: '2px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '2px 2px 0px var(--border-color)',
        }}
      >
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px 0' }}>
          📥 Impor Soal dari JSON
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-muted)', marginBottom: '10px', fontWeight: 600 }}>
          Tempelkan array JSON soal kuis ke dalam kotak di bawah ini:
        </p>

        {importError && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--color-danger-light)',
              border: '2px solid var(--color-danger)',
              borderRadius: '6px',
              color: '#991B1B',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            ⚠️ {importError}
          </div>
        )}

        <label htmlFor="import-textarea" style={{ fontSize: '0.78rem', fontWeight: 800, marginBottom: '6px' }}>
          DATA JSON BANK SOAL
        </label>
        <textarea
          id="import-textarea"
          value={importJsonText}
          onChange={(e) => setImportJsonText(e.target.value)}
          placeholder={jsonPlaceholder}
          rows={8}
          required
          className="player-input"
          style={{
            width: '100%',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.82rem',
            boxSizing: 'border-box',
            marginBottom: '14px',
            backgroundColor: '#FFFFFF',
          }}
        />

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        >
          📥 Proses Impor Soal ke Bank Kuis
        </button>
      </form>
    </div>
  );
}
