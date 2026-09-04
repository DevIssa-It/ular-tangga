'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QuizQuestion } from '@/lib/types';
import {
  QUIZ_QUESTIONS,
  getCustomQuestions,
  saveCustomQuestion,
  deleteCustomQuestion,
} from '@/lib/quiz-bank';
import AdminLoginCard from '@/components/Admin/AdminLoginCard';
import QuestionListView from '@/components/Admin/QuestionListView';
import CreateQuestionView from '@/components/Admin/CreateQuestionView';
import ImportExportView from '@/components/Admin/ImportExportView';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE' | 'IMPORT'>('LIST');
  const [customList, setCustomList] = useState<QuizQuestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const reloadCustom = () => setCustomList(getCustomQuestions());

  useEffect(() => {
    if (isAuthenticated) reloadCustom();
  }, [isAuthenticated]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsVerifying(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPasswordInput('');
        reloadCustom();
      } else {
        setLoginError(data.error || 'Password Admin salah!');
      }
    } catch {
      setLoginError('Gagal memverifikasi password.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveQuestion = (q: Omit<QuizQuestion, 'id'>) => {
    const newQuestion: QuizQuestion = {
      ...q,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    saveCustomQuestion(newQuestion);
    reloadCustom();
    setSuccessMsg('🎉 Soal baru berhasil disimpan ke Bank Kuis!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Yakin ingin menghapus soal kustom ini?')) {
      deleteCustomQuestion(id);
      reloadCustom();
    }
  };

  const handleImportQuestions = (imported: QuizQuestion[]) => {
    imported.forEach(saveCustomQuestion);
    reloadCustom();
    setSuccessMsg(`✅ Berhasil mengimpor ${imported.length} soal baru!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: 'var(--color-bg)' }}>
        <AdminLoginCard
          passwordInput={passwordInput}
          setPasswordInput={setPasswordInput}
          loginError={loginError}
          isVerifying={isVerifying}
          onSubmit={handleAdminLogin}
        />
      </div>
    );
  }

  const allQuestions = [
    ...customList.map((q) => ({ ...q, isCustom: true })),
    ...QUIZ_QUESTIONS.map((q) => ({ ...q, isCustom: false })),
  ];

  const filteredQuestions =
    selectedCategory === 'SEMUA'
      ? allQuestions
      : selectedCategory === 'KUSTOM'
      ? allQuestions.filter((q) => q.isCustom)
      : allQuestions.filter((q) => q.category === selectedCategory);

  return (
    <div style={{ minHeight: '100vh', padding: '24px', backgroundColor: 'var(--color-bg)' }}>
      <div
        style={{
          maxWidth: '840px',
          margin: '0 auto',
          backgroundColor: 'var(--color-surface)',
          border: '3px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: '6px 6px 0px var(--border-color)',
          padding: '24px',
        }}
      >
        {/* Header Dashboard Admin */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid var(--border-color)',
            paddingBottom: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>
                📝 Dashboard Admin Bank Soal
              </h1>
              <span
                style={{
                  fontSize: '0.7rem',
                  backgroundColor: 'var(--color-success)',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 800,
                }}
              >
                TERAUTENTIKASI
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--color-ink-muted)', margin: '4px 0 0 0', fontWeight: 600 }}>
              Kelola soal kuis kustom dan kunci jawaban untuk permainan Ular Tangga
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              href="/"
              className="btn btn-sm"
              style={{ textDecoration: 'none', color: 'var(--color-ink)' }}
            >
              🎮 Kembali ke Game
            </Link>
            <button
              type="button"
              onClick={() => setIsAuthenticated(false)}
              className="btn btn-sm"
              style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
            >
              🔒 Logout
            </button>
          </div>
        </div>

        {/* Tab Navigasi Solid */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('LIST')}
            className={`btn ${activeTab === 'LIST' ? 'btn-primary' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            📋 Daftar Soal ({allQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CREATE')}
            className={`btn ${activeTab === 'CREATE' ? 'btn-primary' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            ➕ Tambah Soal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('IMPORT')}
            className={`btn ${activeTab === 'IMPORT' ? 'btn-primary' : ''}`}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            📁 Impor / Ekspor
          </button>
        </div>

        {successMsg && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-success-light)',
              border: '2px solid var(--color-success)',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: '#166534',
              marginBottom: '16px',
            }}
          >
            {successMsg}
          </div>
        )}

        {activeTab === 'LIST' && (
          <QuestionListView
            questions={filteredQuestions}
            customCount={customList.length}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onDelete={handleDeleteQuestion}
          />
        )}

        {activeTab === 'CREATE' && (
          <CreateQuestionView onSaveQuestion={handleSaveQuestion} />
        )}

        {activeTab === 'IMPORT' && (
          <ImportExportView
            questionsToExport={allQuestions}
            onImportQuestions={handleImportQuestions}
          />
        )}
      </div>
    </div>
  );
}
