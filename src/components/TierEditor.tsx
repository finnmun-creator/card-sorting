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
  const [labels, setLabels] = useState<Record<string, string>>({});

  function getLabel(tier: Tier) {
    return labels[tier.id] ?? tier.label;
  }

  async function handleLabelChange(tierId: string, label: string) {
    setLabels((prev) => ({ ...prev, [tierId]: label }));
  }

  async function handleLabelBlur(tier: Tier) {
    const newLabel = (labels[tier.id] ?? tier.label).trim();
    if (newLabel && newLabel !== tier.label) {
      await updateTier(tier.id, { label: newLabel });
      onUpdate();
    }
  }

  async function handleColorChange(tierId: string, color: string) {
    await updateTier(tierId, { color });
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
            <input
              type="color"
              value={tier.color}
              onChange={(e) => handleColorChange(tier.id, e.target.value)}
              className="w-7 h-7 rounded cursor-pointer bg-transparent border border-[var(--border-default)]"
            />
            <input
              value={getLabel(tier)}
              onChange={(e) => handleLabelChange(tier.id, e.target.value)}
              onBlur={() => handleLabelBlur(tier)}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-2 py-1 text-sm flex-1 outline-none focus:border-[var(--accent-primary)] text-[var(--text-primary)] transition"
            />
            <button onClick={() => handleDelete(tier.id)} className="text-[var(--text-tertiary)] hover:text-red-400 text-xs transition">삭제</button>
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
