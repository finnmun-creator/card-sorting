'use client';

import { useDroppable } from '@dnd-kit/core';
import type { Tier, Card } from '@/types';
import CardItem from './CardItem';

interface Props {
  tier: Tier;
  cards: Card[];
  onCardClick?: (card: Card) => void;
}

export default function TierRow({ tier, cards, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: tier.id });

  return (
    <div className="flex min-h-[180px]">
      <div
        className="w-24 shrink-0 flex items-center justify-center font-bold text-xl rounded-l"
        style={{ backgroundColor: tier.color, color: '#000' }}
      >
        {tier.label}
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-wrap gap-2 p-2 rounded-r border-2 transition min-h-[180px] ${
          isOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 bg-gray-900'
        }`}
      >
        {cards.map((card) => (
          <CardItem key={card.id} card={card} onClick={() => onCardClick?.(card)} />
        ))}
      </div>
    </div>
  );
}
