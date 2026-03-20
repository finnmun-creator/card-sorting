'use client';

import { useDraggable } from '@dnd-kit/core';
import type { Card } from '@/types';

interface Props {
  card: Card;
  onClick?: () => void;
}

export default function CardItem({ card, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (!isDragging && onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`bg-gray-700 hover:bg-gray-600 rounded w-[88px] h-[88px] flex flex-col items-center justify-center text-xs cursor-grab active:cursor-grabbing transition shrink-0 select-none ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {card.image_url && (
        <img src={card.image_url} alt="" className="w-12 h-12 object-cover rounded mb-1" />
      )}
      <span className="truncate max-w-[76px] text-center px-1">{card.title || '카드'}</span>
    </div>
  );
}
