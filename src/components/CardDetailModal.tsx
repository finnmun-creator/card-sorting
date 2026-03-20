'use client';

import { useState } from 'react';
import type { Card } from '@/types';
import { updateCard, deleteCard } from '@/lib/db';

interface Props {
  card: Card;
  onClose: () => void;
  onUpdate: (updated: Card) => void;
  onDelete: (id: string) => void;
}

export default function CardDetailModal({ card, onClose, onUpdate, onDelete }: Props) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [tags, setTags] = useState(card.tags.join(', '));
  const [source, setSource] = useState(card.source);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const updates = {
      title,
      description,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      source,
    };
    await updateCard(card.id, updates);
    onUpdate({ ...card, ...updates });
    onClose();
  }

  async function handleDelete() {
    await deleteCard(card.id);
    onDelete(card.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-xl p-6 w-full max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">카드 상세</h2>

        <label className="block">
          <span className="text-sm text-gray-400">제목</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-800 rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-400">설명</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-gray-800 rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </label>

        {card.image_url && (
          <div>
            <span className="text-sm text-gray-400">이미지</span>
            <img src={card.image_url} alt="" className="mt-1 rounded max-h-40 object-contain" />
          </div>
        )}

        <label className="block">
          <span className="text-sm text-gray-400">태그 (쉼표 구분)</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="pain, 거래, UX"
            className="w-full bg-gray-800 rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-400">출처</span>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full bg-gray-800 rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <div className="flex justify-between pt-2">
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 text-sm transition"
          >
            삭제
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-gray-400 hover:text-white px-3 py-1.5 transition">
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded font-medium transition disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
