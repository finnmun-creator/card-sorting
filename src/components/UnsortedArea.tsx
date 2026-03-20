'use client';

import { useDroppable } from '@dnd-kit/core';
import type { Card } from '@/types';
import CardItem, { type CardDisplayMode } from './CardItem';

interface Props {
  cards: Card[];
  displayMode?: CardDisplayMode;
  onCardClick?: (card: Card) => void;
  addButton?: React.ReactNode;
}

export default function UnsortedArea({ cards, displayMode = 'memo', onCardClick, addButton }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: 'unsorted' });

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">미분류</h3>
        {addButton}
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-wrap items-start gap-2 p-3 rounded-md border-2 border-dashed min-h-[130px] max-h-[260px] overflow-y-auto transition ${
          isOver
            ? 'border-[var(--accent-primary)] bg-blue-50/50'
            : 'border-[var(--border-default)] bg-white/50'
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
        {cards.length === 0 && (
          <div className="text-[var(--text-tertiary)] text-xs m-auto">카드를 여기에 놓으면 미분류됩니다</div>
        )}
      </div>
    </div>
  );
}
