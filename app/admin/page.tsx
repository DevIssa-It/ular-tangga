'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { QuizQuestion } from '@/lib/types';
import { QUIZ_QUESTIONS, getCustomQuestions, saveCustomQuestion, deleteCustomQuestion } from '@/lib/quiz-bank';
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
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isDbOnline, setIsDbOnline] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch('/api/quiz?all=true');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setIsDbOnline(true);
        return;
      }
    } catch {
      // Fallback lokal jika offline
    }
    const localCustom = getCustomQuestions().map((q) => ({ ...q, isCustom: true }));
    const localDefaults = QUIZ_QUESTIONS.map((q) => ({ ...q, isCustom: false }));
    setQuestions([...localCustom, ...localDefaults]);
    setIsDbOnline(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchQuestions();
  }, [isAuthenticated, fetchQuestions]);

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
        fetchQuestions();
      } else {
        setLoginError(data.error || 'Password Admin salah!');
      }
    } catch {
      setLoginError('Gagal memverifikasi password.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveQuestion = async (q: Omit<QuizQuestion, 'id'>) => {
    const newQuestion: QuizQuestion = {
      ...q,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isCustom: true,
    };

    saveCustomQuestion(newQuestion); // Simpan fallback lokal
    try {
      await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      });
    } catch (e) {
      console.warn('Gagal sinkron ke Neon DB, tersimpan di lokal:', e);
    }

    await fetchQuestions();
    setSuccessMsg('🎉 Soal baru berhasil disimpan ke Bank Kuis!');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Yakin ingin menghapus soal ini?')) return;
    deleteCustomQuestion(id); // Hapus lokal
    try {
      await fetch(`/api/quiz?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Gagal menghapus soal:', e);
    }
    await fetchQuestions();
  };

  const handleImportQuestions = async (imported: QuizQuestion[]) => {
    imported.forEach((q) => saveCustomQuestion({ ...q, isCustom: true }));
    try {
      await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: imported }),
      });
    } catch (e) {
      console.warn('Gagal batch import:', e);
    }
    await fetchQuestions();
    setSuccessMsg(`✅ Berhasil mengimpor ${imported.length} soal baru!`);
    setTimeout(() => setSuccessMsg(''), 3500);
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

  const customCount = questions.filter((q) => q.isCustom).length;
  const filteredQuestions =
    selectedCategory === 'SEMUA'
      ? questions
      : selectedCategory === 'KUSTOM'
      ? questions.filter((q) => q.isCustom)
      : questions.filter((q) => q.category === selectedCategory);

  return (
    <div style={{ minHeight: '100vh', padding: '24px', backgroundColor: 'var(--color-bg)' }}>
      <div className="card-solid" style={{ maxWidth: '880px', margin: '0 auto', padding: '24px' }}>
        {/* Header Dashboard Admin */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>
                📝 Dashboard Admin Bank Soal
              </h1>
              <span style={{ fontSize: '0.7rem', backgroundColor: isDbOnline ? 'var(--color-success)' : 'var(--color-quiz)', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                {isDbOnline ? '🟢 SERVER TERSINKRON' : '🟡 MODE OFFLINE'}
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--color-ink-muted)', margin: '4px 0 0 0', fontWeight: 600 }}>
              Kelola soal kuis dan kunci jawaban untuk permainan Ular Tangga
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/" className="btn btn-sm" style={{ textDecoration: 'none', color: 'var(--color-ink)' }}>
              🎮 Kembali ke Game
            </Link>
            <button type="button" onClick={() => setIsAuthenticated(false)} className="btn btn-sm" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
              🔒 Logout
            </button>
          </div>
        </div>

        {/* Tab Navigasi */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button type="button" onClick={() => setActiveTab('LIST')} className={`btn ${activeTab === 'LIST' ? 'btn-primary' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>
            📋 Daftar Soal ({questions.length})
          </button>
          <button type="button" onClick={() => setActiveTab('CREATE')} className={`btn ${activeTab === 'CREATE' ? 'btn-primary' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>
            ➕ Tambah Soal
          </button>
          <button type="button" onClick={() => setActiveTab('IMPORT')} className={`btn ${activeTab === 'IMPORT' ? 'btn-primary' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>
            📁 Impor / Ekspor
          </button>
        </div>

        {successMsg && (
          <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-success-light)', border: '2px solid var(--color-success)', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', color: '#166534', marginBottom: '16px' }}>
            {successMsg}
          </div>
        )}

        {activeTab === 'LIST' && (
          <QuestionListView
            questions={filteredQuestions}
            customCount={customCount}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onDelete={handleDeleteQuestion}
          />
        )}
        {activeTab === 'CREATE' && <CreateQuestionView onSaveQuestion={handleSaveQuestion} />}
        {activeTab === 'IMPORT' && <ImportExportView questionsToExport={questions} onImportQuestions={handleImportQuestions} />}
      </div>
    </div>
  );
}
