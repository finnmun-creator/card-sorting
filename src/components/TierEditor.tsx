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
    await addTier(sessionId, 'New', '#808080', maxOrder + 1);
    onUpdate();
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4 space-y-2">
      <h3 className="text-sm font-semibold text-gray-400 mb-2">티어 편집</h3>
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
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  className="bg-gray-800 rounded px-2 py-1 text-sm flex-1 outline-none"
                  autoFocus
                />
                <button onClick={saveEdit} className="text-blue-400 text-sm">저장</button>
                <button onClick={() => setEditing(null)} className="text-gray-500 text-sm">취소</button>
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded" style={{ backgroundColor: tier.color }} />
                <span className="flex-1 text-sm">{tier.label}</span>
                <button onClick={() => startEdit(tier)} className="text-gray-500 hover:text-white text-xs">편집</button>
                <button onClick={() => handleDelete(tier.id)} className="text-gray-500 hover:text-red-400 text-xs">삭제</button>
              </>
            )}
          </div>
        ))}
      <button onClick={handleAdd} className="text-blue-400 hover:text-blue-300 text-sm mt-2">
        + 행 추가
      </button>
    </div>
  );
}
