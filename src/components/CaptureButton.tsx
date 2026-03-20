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
        backgroundColor: '#030712',
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
      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition"
    >
      이미지 저장
    </button>
  );
}
