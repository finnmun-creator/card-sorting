'use client';

import { toPng } from 'html-to-image';

interface Props {
  targetId: string;
}

export default function CaptureButton({ targetId }: Props) {
  async function handleCapture() {
    const node = document.getElementById(targetId);
    if (!node) return;
    try {
      const dataUrl = await toPng(node, {
        backgroundColor: '#F5F5F5',
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `card-sorting-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('캡처 실패:', err);
    }
  }

  return (
    <button
      onClick={handleCapture}
      className="bg-white border border-[var(--border-default)] hover:border-[var(--border-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-9 px-3 rounded-md text-sm transition flex items-center gap-1.5"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      이미지 저장
    </button>
  );
}
