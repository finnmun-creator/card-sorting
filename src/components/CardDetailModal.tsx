'use client';

import { useState } from 'react';
import type { Card } from '@/types';
import { updateCard, deleteCard, uploadCardImage } from '@/lib/db';

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
  const [imageUrl, setImageUrl] = useState(card.image_url || '');
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadCardImage(card.session_id, file);
      setImageUrl(url);
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const updates = {
      title,
      description,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      source,
      image_url: imageUrl || null,
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

  const inputClass = "w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-3 py-2 mt-1 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition";
  const labelClass = "text-xs font-medium text-[var(--text-secondary)]";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-[var(--text-primary)]">카드 상세</h2>

        <label className="block">
          <span className={labelClass}>제목</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>설명</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </label>

        <div>
          <span className={labelClass}>이미지</span>
          {imageUrl && (
            <div className="relative mt-1">
              <img src={imageUrl} alt="" className="rounded-md max-h-40 object-contain border border-[var(--border-default)]" />
              <button
                onClick={() => setImageUrl('')}
                className="absolute top-1 right-1 bg-white border border-[var(--border-default)] hover:bg-[var(--bg-canvas)] rounded-full w-6 h-6 flex items-center justify-center text-xs text-[var(--text-secondary)] transition"
              >
                ✕
              </button>
            </div>
          )}
          <label className={`mt-2 block w-full text-center border border-dashed border-[var(--border-default)] rounded-md py-3 cursor-pointer hover:border-[var(--border-hover)] transition text-sm text-[var(--text-tertiary)] ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? '업로드 중...' : '이미지 선택'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>태그 (쉼표 구분)</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="pain, 거래, UX"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>출처</span>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={inputClass}
          />
        </label>

        <div className="flex justify-between pt-2 border-t border-[var(--border-default)]">
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-500 text-sm transition"
          >
            삭제
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 text-sm transition"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white px-4 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-40"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
