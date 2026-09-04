'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QuizQuestion, Player } from '@/lib/types';
import { soundEngine } from '@/lib/audio';

interface QuizModalProps {
  question: QuizQuestion;
  player: Player;
  onAnswer?: (isCorrect: boolean) => void;
  isSpectator?: boolean;
}

export default function QuizModal({ question, player, onAnswer, isSpectator = false }: QuizModalProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Jalankan hitung mundur 15 detik (hanya jika bukan penonton)
  useEffect(() => {
    setTimeLeft(15);
    setSelectedIndex(null);
    setIsAnswered(false);

    if (isSpectator) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        if (prev <= 5) {
          soundEngine.playQuizTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question, isSpectator]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    soundEngine.playWrong();
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedIndex(idx);
    setIsAnswered(true);

    const isCorrect = idx === question.correctIndex;
    if (isCorrect) {
      soundEngine.playCorrect();
    } else {
      soundEngine.playWrong();
    }
  };

  const handleContinue = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const isCorrect = selectedIndex === question.correctIndex;
    onAnswer?.(isCorrect);
  };

  const letters = ['A', 'B', 'C', 'D'];
  const isCorrect = selectedIndex === question.correctIndex;
  const isTimeout = selectedIndex === null && isAnswered;

  return (
    <div className="modal-backdrop is-open">
      <div className="modal-box">
        {/* Header Kuis */}
        <div className="quiz-header">
          <span className="quiz-category-tag">
            Trivia: {question.category}
          </span>
          <div className="quiz-timer-wrap">
            <span>⏱️</span>
            <span>{isSpectator ? 'Live' : `${timeLeft}s`}</span>
          </div>
        </div>

        {/* Progress Bar Timer Solid */}
        {!isSpectator && (
          <div className="quiz-timer-bar-container">
            <div
              className="quiz-timer-bar"
              style={{
                width: `${(timeLeft / 15) * 100}%`,
                backgroundColor: timeLeft <= 5 ? 'var(--color-danger)' : 'var(--color-quiz)',
              }}
            />
          </div>
        )}

        {/* Subtitle Pemain yang Menjawab */}
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-ink-muted)', marginBottom: '8px' }}>
          Giliran: <span style={{ color: player.color }}>{player.name} {player.avatar}</span>
        </div>

        {/* Teks Soal */}
        <h3 className="quiz-question-text">{question.question}</h3>

        {/* Opsi Jawaban */}
        <div className="quiz-options-list">
          {question.options.map((option, idx) => {
            let extraClass = '';
            if (isAnswered) {
              if (idx === question.correctIndex) {
                extraClass = 'correct';
              } else if (idx === selectedIndex) {
                extraClass = 'wrong';
              }
            }

            return (
              <button
                key={`opt-${idx}`}
                type="button"
                className={`quiz-option-btn ${extraClass}`}
                onClick={() => !isSpectator && handleSelectOption(idx)}
                disabled={isAnswered || isSpectator}
              >
                <div className="quiz-option-letter">{letters[idx]}</div>
                <div>{option}</div>
              </button>
            );
          })}
        </div>

        {isSpectator && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#EFF6FF',
              border: '2px solid #2563EB',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#1E40AF',
              textAlign: 'center',
            }}
          >
            👀 Anda sedang menonton. Menunggu <strong>{player.name}</strong> memilih jawaban di layarnya...
          </div>
        )}

        {/* Feedback & Penjelasan Edukatif */}
        {isAnswered && (
          <div className={`quiz-feedback-box show ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
            <div style={{ fontWeight: 800, marginBottom: '4px' }}>
              {isCorrect
                ? '🎉 Jawaban Tepat! Bonus +2 Petak'
                : isTimeout
                ? '⏰ Waktu Habis! Penalti -1 Petak'
                : '❌ Jawaban Kurang Tepat! Penalti -1 Petak'}
            </div>
            <div style={{ fontSize: '0.85rem' }}>{question.explanation}</div>
          </div>
        )}

        {/* Tombol Lanjut */}
        {isAnswered && (
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            onClick={handleContinue}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Memproses Langkah... ➔' : 'Lanjutkan Permainan ➔'}
          </button>
        )}
      </div>
    </div>
  );
}
