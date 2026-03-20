'use client';

import { useDroppable } from '@dnd-kit/core';
import type { Tier, Card } from '@/types';
import CardItem, { type CardDisplayMode } from './CardItem';

interface Props {
  tier: Tier;
  cards: Card[];
  displayMode?: CardDisplayMode;
  onCardClick?: (card: Card) => void;
}

export default function TierRow({ tier, cards, displayMode = 'memo', onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: tier.id });

  return (
    <div className="flex min-h-[130px]">
      <div
        className="w-20 shrink-0 flex items-center justify-center font-semibold text-sm rounded-l-md border border-r-0 border-[var(--border-default)]"
        style={{ backgroundColor: tier.color, color: 'var(--text-primary)' }}
      >
        {tier.label}
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-wrap items-start gap-2 p-2.5 rounded-r-md border transition ${
          isOver
            ? 'border-[var(--accent-primary)] bg-blue-50/50'
            : 'border-[var(--border-default)] bg-white'
        }`}
      >
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            displayMode={displayMode}
            onClick={() => onCardClick?.(card)}
          />
        ))}
      </div>
    </div>
  );
}
