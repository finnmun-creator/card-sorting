import { NextRequest, NextResponse } from 'next/server';

const BOT_PATTERNS = [
  'kakaotalk-scrap',
  'facebookexternalhit',
  'Twitterbot',
  'Slackbot',
  'LinkedInBot',
  'Discordbot',
  'TelegramBot',
  'WhatsApp',
  'Line/',
  'Googlebot',
  'bingbot',
];

export function proxy(request: NextRequest) {
  const ua = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;

  // Only intercept /board/[code] routes for bots
  if (pathname.startsWith('/board/')) {
    const isBot = BOT_PATTERNS.some((pattern) =>
      ua.toLowerCase().includes(pattern.toLowerCase())
    );
    if (isBot) {
      const code = pathname.replace('/board/', '');
      const ogUrl = new URL(`/api/og/${code}`, request.url);
      return NextResponse.rewrite(ogUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/board/:code*',
};
