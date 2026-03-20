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
    if (!title.trim()) return;
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
        className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition"
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
        className="bg-gray-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      {imagePreview && (
        <img src={imagePreview} alt="" className="w-10 h-10 rounded object-cover" />
      )}
      <label className="bg-gray-700 hover:bg-gray-600 px-2 py-2 rounded text-sm cursor-pointer transition">
        📷
        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </label>
      <button
        onClick={handleAdd}
        disabled={adding}
        className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm disabled:opacity-50"
      >
        추가
      </button>
      <button onClick={() => { setShowInput(false); setTitle(''); setImageFile(null); setImagePreview(null); }} className="text-gray-400 hover:text-white text-sm">
        취소
      </button>
    </div>
  );
}
