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
      className="bg-white border border-[var(--border-default)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] px-3 py-1.5 rounded-md text-sm transition"
    >
      이미지 저장
    </button>
  );
}
