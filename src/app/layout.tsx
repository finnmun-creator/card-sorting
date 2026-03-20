import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Card Sorting',
  description: '실시간 협업 카드소팅 서비스',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen" style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>{children}</body>
    </html>
  );
}
