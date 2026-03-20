'use client';

import { useDroppable } from '@dnd-kit/core';
import type { Card } from '@/types';
import CardItem from './CardItem';

interface Props {
  cards: Card[];
  onCardClick?: (card: Card) => void;
}

export default function UnsortedArea({ cards, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: 'unsorted' });

  return (
    <div className="mt-4">
      <h3 className="text-sm text-gray-400 mb-2">미분류</h3>
      <div
        ref={setNodeRef}
        className={`flex flex-wrap gap-2 p-4 rounded-lg border-2 border-dashed min-h-[180px] transition ${
          isOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-900/50'
        }`}
      >
        {cards.map((card) => (
          <CardItem key={card.id} card={card} onClick={() => onCardClick?.(card)} />
        ))}
        {cards.length === 0 && (
          <div className="text-gray-600 text-sm m-auto">카드를 여기에 놓으면 미분류됩니다</div>
        )}
      </div>
    </div>
  );
}
