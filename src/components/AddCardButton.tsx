'use client';

import { useState } from 'react';
import { addCard, uploadCardImage } from '@/lib/db';
import type { Card } from '@/types';

interface Props {
  sessionId: string;
  onAdd: (card: Card) => void;
}

export default function AddCardButton({ sessionId, onAdd }: Props) {
  const [showInput, setShowInput] = useState(false);
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleAdd() {
    if (!title.trim() || adding) return;
    setAdding(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadCardImage(sessionId, imageFile);
      }
      const card = await addCard(sessionId, {
        title: title.trim(),
        sort_order: 0,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      });
      onAdd(card);
      setTitle('');
      setImageFile(null);
      setImagePreview(null);
      setShowInput(false);
    } catch (err) {
      console.error('카드 추가 실패:', err);
    } finally {
      setAdding(false);
    }
  }

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white h-9 px-4 rounded-md text-sm font-medium transition"
      >
        + 카드 추가
      </button>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="카드 제목"
        className="bg-white border border-[var(--border-default)] rounded-md px-3 h-9 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition"
      />
      {imagePreview && (
        <img src={imagePreview} alt="" className="w-9 h-9 rounded-md object-cover border border-[var(--border-default)]" />
      )}
      <label className="bg-white border border-[var(--border-default)] hover:border-[var(--border-hover)] px-3 h-9 flex items-center rounded-md text-sm cursor-pointer transition text-[var(--text-secondary)]">
        📷
        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </label>
      <button
        onClick={handleAdd}
        disabled={adding}
        className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white h-9 px-4 rounded-md text-sm font-medium transition disabled:opacity-40"
      >
        추가
      </button>
      <button
        onClick={() => { setShowInput(false); setTitle(''); setImageFile(null); setImagePreview(null); }}
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm h-9 flex items-center transition"
      >
        취소
      </button>
    </div>
  );
}
