import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === correctPassword) {
      return NextResponse.json({
        success: true,
        message: 'Login Admin berhasil.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Password Admin salah!' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
