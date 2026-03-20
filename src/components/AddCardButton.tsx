'use client';

import { useState } from 'react';
import { addCard } from '@/lib/db';
import type { Card } from '@/types';

interface Props {
  sessionId: string;
  onAdd: (card: Card) => void;
}

export default function AddCardButton({ sessionId, onAdd }: Props) {
  const [showInput, setShowInput] = useState(false);
  const [title, setTitle] = useState('');

  async function handleAdd() {
    if (!title.trim()) return;
    const card = await addCard(sessionId, { title: title.trim(), sort_order: Date.now() });
    onAdd(card);
    setTitle('');
    setShowInput(false);
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
    <div className="flex gap-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="카드 제목"
        className="bg-gray-800 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">
        추가
      </button>
      <button onClick={() => { setShowInput(false); setTitle(''); }} className="text-gray-400 hover:text-white text-sm">
        취소
      </button>
    </div>
  );
}
