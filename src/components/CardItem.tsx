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

  const firstTag = card.tags?.[0] || null;

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
      className={`bg-white rounded-xl shadow-md w-[180px] cursor-grab active:cursor-grabbing transition select-none shrink-0 overflow-hidden ${
        isDragging ? 'opacity-50 shadow-xl scale-105' : 'hover:shadow-lg'
      }`}
    >
      {/* 이미지 영역 */}
      <div className="h-[100px] rounded-t-xl overflow-hidden">
        {card.image_url ? (
          <img
            src={card.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-200 to-emerald-300 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
              <path d="M21 15l-5-5L5 21" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-3">
        {firstTag && (
          <span className="inline-block bg-gray-200 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full mb-1">
            {firstTag}
          </span>
        )}
        <h4 className="text-gray-900 font-bold text-sm leading-tight truncate">
          {card.title || '카드'}
        </h4>
        {card.description && (
          <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
            {card.description}
          </p>
        )}
      </div>
    </div>
  );
}
