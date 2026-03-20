'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '@/types';

export type CardDisplayMode = 'memo' | 'image';

interface Props {
  card: Card;
  displayMode?: CardDisplayMode;
  onClick?: () => void;
}

const MEMO_COLOR = '#FFF9C4';

export default function CardItem({ card, displayMode = 'memo', onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (displayMode === 'image') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={(e) => { if (!isDragging && onClick) { e.stopPropagation(); onClick(); } }}
        className={`w-[130px] bg-white border border-[var(--border-default)] rounded-md overflow-hidden cursor-grab active:cursor-grabbing select-none shrink-0 transition-shadow ${
          isDragging ? 'opacity-40 shadow-lg scale-[1.02]' : 'hover:shadow-md hover:border-[var(--border-hover)]'
        }`}
      >
        <div className="h-[85px] bg-[var(--bg-muted)] overflow-hidden">
          {card.image_url ? (
            <img src={card.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
        <div className="px-2.5 py-2">
          <p className="text-[var(--text-primary)] text-xs font-medium leading-tight truncate">
            {card.title || '제목 없음'}
          </p>
        </div>
      </div>
    );
  }

  // memo mode
  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: MEMO_COLOR }}
      {...listeners}
      {...attributes}
      onClick={(e) => { if (!isDragging && onClick) { e.stopPropagation(); onClick(); } }}
      className={`w-[130px] h-[115px] rounded-md p-2.5 cursor-grab active:cursor-grabbing select-none shrink-0 transition-shadow flex flex-col ${
        isDragging ? 'opacity-40 shadow-lg scale-[1.02]' : 'hover:shadow-md'
      }`}
    >
      <p className="text-[var(--text-primary)] text-xs font-semibold leading-tight line-clamp-2">
        {card.title || '제목 없음'}
      </p>
      {card.description && (
        <p className="text-[var(--text-secondary)] text-[11px] mt-1.5 leading-relaxed line-clamp-4 flex-1">
          {card.description}
        </p>
      )}
    </div>
  );
}
