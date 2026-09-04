'use client';

import React from 'react';
import Link from 'next/link';

interface AdminLoginCardProps {
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  loginError: string;
  isVerifying: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AdminLoginCard({
  passwordInput,
  setPasswordInput,
  loginError,
  isVerifying,
  onSubmit,
}: AdminLoginCardProps) {
  return (
    <div
      style={{
        maxWidth: '440px',
        width: '100%',
        margin: '60px auto',
        backgroundColor: 'var(--color-surface)',
        border: '3px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: '6px 6px 0px var(--border-color)',
        padding: '28px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            backgroundColor: 'var(--color-primary-light)',
            border: '2.5px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: '3px 3px 0px var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            margin: '0 auto 12px auto',
          }}
        >
          🔐
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 6px 0' }}>
          Portal Admin Bank Soal
        </h1>
        <p
          style={{
            fontSize: '0.84rem',
            color: 'var(--color-ink-muted)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Area khusus admin dan guru untuk menyusun soal kuis, kunci jawaban, dan materi edukasi.
        </p>
      </div>

      {loginError && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-danger-light)',
            border: '2px solid var(--color-danger)',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: '#991B1B',
            marginBottom: '16px',
          }}
        >
          ⚠️ {loginError}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '18px' }}>
          <label
            htmlFor="admin-password"
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 800,
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Password Admin
          </label>
          <input
            id="admin-password"
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Masukkan password admin..."
            required
            autoFocus
            className="player-input"
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px' }}
          />
          <div
            style={{
              fontSize: '0.74rem',
              color: 'var(--color-ink-faint)',
              marginTop: '6px',
            }}
          >
            * Password default sistem: <code>admin123</code>
          </div>
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}
        >
          {isVerifying ? 'Memverifikasi...' : 'Masuk ke Dashboard ➔'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '2px solid #E4E4E7', paddingTop: '16px' }}>
        <Link
          href="/"
          className="btn btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            color: 'var(--color-ink)',
          }}
        >
          🎮 Kembali ke Permainan
        </Link>
      </div>
    </div>
  );
}
