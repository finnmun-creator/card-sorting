'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSessionByShareCode, getBoardState, moveCard } from '@/lib/db';
import type { BoardState, Card } from '@/types';
import TierRow from './TierRow';
import UnsortedArea from './UnsortedArea';
import CardDetailModal from './CardDetailModal';
import AddCardButton from './AddCardButton';
import TierEditor from './TierEditor';
import { useRealtimeBoard, type BoardEvent } from '@/hooks/useRealtimeBoard';
import CaptureButton from './CaptureButton';
import NicknameModal from './NicknameModal';
import type { CardDisplayMode } from './CardItem';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';

const MEMO_COLORS = ['#FFF9C4', '#E8F5E9', '#E3F2FD', '#FCE4EC', '#F3E5F5'];
function hashColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return MEMO_COLORS[Math.abs(hash) % MEMO_COLORS.length];
}

interface Props {
  shareCode: string;
}

export default function Board({ shareCode }: Props) {
  const [board, setBoard] = useState<BoardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showTierEditor, setShowTierEditor] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [cardDisplayMode, setCardDisplayMode] = useState<CardDisplayMode>('memo');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const { broadcast } = useRealtimeBoard({
    sessionId: board?.session.id ?? '',
    onEvent: (event: BoardEvent) => {
      switch (event.type) {
        case 'card_move':
          setBoard((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              cards: prev.cards.map((c) =>
                c.id === event.cardId ? { ...c, tier_id: event.tierId, sort_order: event.sortOrder } : c
              ),
            };
          });
          break;
        case 'card_add':
          setBoard((prev) => {
            if (!prev) return prev;
            return { ...prev, cards: [...prev.cards, event.card] };
          });
          break;
        case 'card_update':
          setBoard((prev) => {
            if (!prev) return prev;
            return { ...prev, cards: prev.cards.map((c) => (c.id === event.card.id ? event.card : c)) };
          });
          break;
        case 'card_delete':
          setBoard((prev) => {
            if (!prev) return prev;
            return { ...prev, cards: prev.cards.filter((c) => c.id !== event.cardId) };
          });
          break;
        case 'full_sync':
          loadBoard();
          break;
      }
    },
  });

  useEffect(() => {
    loadBoard();
  }, [shareCode]);

  async function loadBoard() {
    const session = await getSessionByShareCode(shareCode);
    if (!session) { setLoading(false); return; }
    const state = await getBoardState(session.id);
    setBoard(state);
    setLoading(false);
  }

  const getCardsForTier = useCallback((tierId: string): Card[] => {
    return (board?.cards ?? [])
      .filter((c) => c.tier_id === tierId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [board?.cards]);

  const getUnsortedCards = useCallback((): Card[] => {
    return (board?.cards ?? [])
      .filter((c) => c.tier_id === null)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [board?.cards]);

  function handleCardUpdate(updated: Card) {
    setBoard((prev) => {
      if (!prev) return prev;
      return { ...prev, cards: prev.cards.map((c) => (c.id === updated.id ? updated : c)) };
    });
    broadcast({ type: 'card_update', card: updated });
  }

  function handleCardDelete(id: string) {
    setBoard((prev) => {
      if (!prev) return prev;
      return { ...prev, cards: prev.cards.filter((c) => c.id !== id) };
    });
    broadcast({ type: 'card_delete', cardId: id });
  }

  function handleCardAdd(card: Card) {
    setBoard((prev) => {
      if (!prev) return prev;
      return { ...prev, cards: [...prev.cards, card] };
    });
    broadcast({ type: 'card_add', card });
  }

  function handleDragStart(event: DragStartEvent) {
    const card = board?.cards.find((c) => c.id === event.active.id);
    setActiveCard(card ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || !board) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    let newTierId: string | null = null;
    if (overId !== 'unsorted') {
      const targetTier = board.tiers.find((t) => t.id === overId);
      if (targetTier) {
        newTierId = targetTier.id;
      } else {
        const targetCard = board.cards.find((c) => c.id === overId);
        newTierId = targetCard?.tier_id ?? null;
      }
    }

    const currentCard = board.cards.find((c) => c.id === cardId);
    if (currentCard?.tier_id === newTierId) return;

    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === cardId ? { ...c, tier_id: newTierId, sort_order: 0 } : c
        ),
      };
    });

    await moveCard(cardId, newTierId, 0);
    broadcast({ type: 'card_move', cardId, tierId: newTierId, sortOrder: 0 });
  }

  if (loading) return <div className="text-center py-20 text-[var(--text-tertiary)] text-sm">보드 로딩 중...</div>;
  if (!nickname) return <NicknameModal onSubmit={setNickname} />;
  if (!board) return <div className="text-center py-20 text-red-400 text-sm">세션을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Card Sorting</h1>
        <div className="flex items-center gap-2">
          {/* 카드 표시 모드 토글 */}
          <div className="flex items-center border border-[var(--border-default)] rounded-md overflow-hidden">
            <button
              onClick={() => setCardDisplayMode('memo')}
              className={`px-3 py-1.5 text-xs transition ${
                cardDisplayMode === 'memo'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              메모
            </button>
            <button
              onClick={() => setCardDisplayMode('image')}
              className={`px-3 py-1.5 text-xs transition ${
                cardDisplayMode === 'image'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              이미지
            </button>
          </div>

          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="bg-white border border-[var(--border-default)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] px-3 py-1.5 rounded-md text-xs transition"
          >
            링크 복사
          </button>
          <CaptureButton targetId="board-capture" />
          <AddCardButton sessionId={board.session.id} onAdd={handleCardAdd} />
          <button
            onClick={() => setShowTierEditor(!showTierEditor)}
            className={`bg-white border px-3 py-1.5 rounded-md text-xs transition ${
              showTierEditor
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                : 'border-[var(--border-default)] hover:border-[var(--border-hover)] text-[var(--text-primary)]'
            }`}
          >
            티어 편집
          </button>
        </div>
      </div>

      {/* 티어 편집 */}
      {showTierEditor && (
        <div className="mb-4">
          <TierEditor tiers={board.tiers} sessionId={board.session.id} onUpdate={loadBoard} />
        </div>
      )}

      {/* 보드 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div id="board-capture" className="space-y-1">
          {board.tiers
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((tier) => (
              <TierRow
                key={tier.id}
                tier={tier}
                cards={getCardsForTier(tier.id)}
                displayMode={cardDisplayMode}
                onCardClick={setSelectedCard}
              />
            ))}
        </div>

        <UnsortedArea
          cards={getUnsortedCards()}
          displayMode={cardDisplayMode}
          onCardClick={setSelectedCard}
        />

        <DragOverlay>
          {activeCard ? (
            cardDisplayMode === 'image' ? (
              <div className="w-[160px] bg-white border border-[var(--border-default)] rounded-md overflow-hidden shadow-lg opacity-90">
                <div className="h-[110px] bg-[var(--bg-muted)]">
                  {activeCard.image_url && (
                    <img src={activeCard.image_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-xs font-medium truncate text-[var(--text-primary)]">{activeCard.title || '카드'}</p>
                </div>
              </div>
            ) : (
              <div
                className="w-[140px] h-[140px] rounded-md p-3 shadow-lg opacity-90 flex flex-col"
                style={{ backgroundColor: hashColor(activeCard.id) }}
              >
                <p className="text-xs font-semibold text-[var(--text-primary)]">{activeCard.title || '카드'}</p>
              </div>
            )
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
        />
      )}
    </div>
  );
}
