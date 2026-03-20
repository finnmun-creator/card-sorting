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
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [tags, setTags] = useState(card.tags.join(', '));
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(card.image_url || '');
  const [uploading, setUploading] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);

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
      image_url: imageUrl || null,
    };
    await updateCard(card.id, updates);
    onUpdate({ ...card, ...updates });
    setEditing(false);
    setSaving(false);
  }

  async function handleDelete() {
    await deleteCard(card.id);
    onDelete(card.id);
    onClose();
  }

  const inputClass = "w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-3 py-2 mt-1 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition";
  const labelClass = "text-xs font-medium text-[var(--text-secondary)]";

  // 이미지 확대 모달
  if (imageZoom && imageUrl) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] cursor-zoom-out" onClick={() => setImageZoom(false)}>
        <img src={imageUrl} alt="" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-md shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 이미지 영역 */}
        {imageUrl && !editing && (
          <div
            className="w-full h-[220px] bg-[var(--bg-muted)] cursor-zoom-in overflow-hidden"
            onClick={() => setImageZoom(true)}
          >
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-5 space-y-3">
          {editing ? (
            /* === 편집 모드 === */
            <>
              <label className="block">
                <span className={labelClass}>제목</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
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
                    <img src={imageUrl} alt="" className="rounded-md max-h-32 object-contain border border-[var(--border-default)]" />
                    <button
                      onClick={() => setImageUrl('')}
                      className="absolute top-1 right-1 bg-white border border-[var(--border-default)] hover:bg-[var(--bg-canvas)] rounded-full w-6 h-6 flex items-center justify-center text-xs text-[var(--text-secondary)] transition"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <label className={`mt-2 block w-full text-center border border-dashed border-[var(--border-default)] rounded-md py-2.5 cursor-pointer hover:border-[var(--border-hover)] transition text-sm text-[var(--text-tertiary)] ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploading ? '업로드 중...' : '이미지 선택'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <label className="block">
                <span className={labelClass}>태그 (쉼표 구분)</span>
                <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="pain, 거래, UX" className={inputClass} />
              </label>

              <div className="flex justify-between pt-3 border-t border-[var(--border-default)]">
                <button onClick={handleDelete} className="text-red-400 hover:text-red-500 text-xs transition">삭제</button>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 text-sm transition">취소</button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white px-4 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-40"
                  >
                    저장
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* === 뷰 모드 === */
            <>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">{card.title || '제목 없음'}</h2>

              {card.description && (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{card.description}</p>
              )}

              {card.tags && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {card.tags.map((tag, i) => (
                    <span key={i} className="bg-[var(--bg-muted)] text-[var(--text-secondary)] text-xs px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-[var(--border-default)] gap-2">
                <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 text-sm transition">닫기</button>
                <button
                  onClick={() => setEditing(true)}
                  className="bg-[var(--bg-canvas)] border border-[var(--border-default)] hover:border-[var(--border-hover)] text-[var(--text-primary)] px-4 py-1.5 rounded-md text-sm font-medium transition"
                >
                  수정
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
