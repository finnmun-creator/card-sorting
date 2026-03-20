'use client';

import { useState } from 'react';
import type { Tier } from '@/types';
import { updateTier, deleteTier, addTier } from '@/lib/db';

interface Props {
  tiers: Tier[];
  sessionId: string;
  onUpdate: () => void;
}

export default function TierEditor({ tiers, sessionId, onUpdate }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState('');

  function startEdit(tier: Tier) {
    setEditing(tier.id);
    setEditLabel(tier.label);
    setEditColor(tier.color);
  }

  async function saveEdit() {
    if (!editing) return;
    await updateTier(editing, { label: editLabel, color: editColor });
    setEditing(null);
    onUpdate();
  }

  async function handleDelete(id: string) {
    await deleteTier(id);
    onUpdate();
  }

  async function handleAdd() {
    const maxOrder = Math.max(0, ...tiers.map((t) => t.sort_order));
    await addTier(sessionId, 'New', '#D5DEE8', maxOrder + 1);
    onUpdate();
  }

  return (
    <div className="bg-white border border-[var(--border-default)] rounded-md p-4 space-y-2 shadow-[var(--shadow-sm)]">
      <h3 className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-3">티어 편집</h3>
      {tiers
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((tier) => (
          <div key={tier.id} className="flex items-center gap-2">
            {editing === tier.id ? (
              <>
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border border-[var(--border-default)]"
                />
                <input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-2 py-1 text-sm flex-1 outline-none focus:border-[var(--accent-primary)] text-[var(--text-primary)] transition"
                  autoFocus
                />
                <button onClick={saveEdit} className="text-[var(--accent-primary)] text-sm hover:text-[var(--accent-primary-hover)] transition">저장</button>
                <button onClick={() => setEditing(null)} className="text-[var(--text-tertiary)] text-sm hover:text-[var(--text-secondary)] transition">취소</button>
              </>
            ) : (
              <>
                <div className="w-5 h-5 rounded-sm border border-[var(--border-default)]" style={{ backgroundColor: tier.color }} />
                <span className="flex-1 text-sm text-[var(--text-primary)]">{tier.label}</span>
                <button onClick={() => startEdit(tier)} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] text-xs transition">편집</button>
                <button onClick={() => handleDelete(tier.id)} className="text-[var(--text-tertiary)] hover:text-red-400 text-xs transition">삭제</button>
              </>
            )}
          </div>
        ))}
      <button
        onClick={handleAdd}
        className="text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] text-sm mt-2 transition"
      >
        + 행 추가
      </button>
    </div>
  );
}
