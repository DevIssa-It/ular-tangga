import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ular Tangga Trivia - Permainan Papan Kuis Multiplayer',
  description: 'Game papan Ular Tangga interaktif 100 petak dengan sistem kuis acak dan multiplayer lokal 2 hingga 6 pemain. Desain modern clean flat bebas gradien.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
