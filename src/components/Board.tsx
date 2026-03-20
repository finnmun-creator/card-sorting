'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSessionByShareCode, getBoardState, moveCard } from '@/lib/db';
import type { BoardState, Card } from '@/types';
import TierRow from './TierRow';
import UnsortedArea from './UnsortedArea';
import CardDetailModal from './CardDetailModal';
import AddCardButton from './AddCardButton';
import TierEditor from './TierEditor';
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

interface Props {
  shareCode: string;
}

export default function Board({ shareCode }: Props) {
  const [board, setBoard] = useState<BoardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showTierEditor, setShowTierEditor] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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
  }

  function handleCardDelete(id: string) {
    setBoard((prev) => {
      if (!prev) return prev;
      return { ...prev, cards: prev.cards.filter((c) => c.id !== id) };
    });
  }

  function handleCardAdd(card: Card) {
    setBoard((prev) => {
      if (!prev) return prev;
      return { ...prev, cards: [...prev.cards, card] };
    });
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

    // 드롭 대상 결정
    let newTierId: string | null = null;
    if (overId !== 'unsorted') {
      const targetTier = board.tiers.find((t) => t.id === overId);
      if (targetTier) {
        newTierId = targetTier.id;
      } else {
        // 카드 위에 드롭한 경우, 해당 카드의 tier_id 사용
        const targetCard = board.cards.find((c) => c.id === overId);
        newTierId = targetCard?.tier_id ?? null;
      }
    }

    // 현재 카드의 tier_id와 같으면 무시
    const currentCard = board.cards.find((c) => c.id === cardId);
    if (currentCard?.tier_id === newTierId) return;

    // 로컬 상태 즉시 업데이트 (optimistic)
    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === cardId ? { ...c, tier_id: newTierId, sort_order: 0 } : c
        ),
      };
    });

    // DB 업데이트
    await moveCard(cardId, newTierId, 0);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">보드 로딩 중...</div>;
  if (!board) return <div className="text-center py-20 text-red-400">세션을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Card Sorting</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-sm transition"
          >
            링크 복사
          </button>
          <AddCardButton sessionId={board.session.id} onAdd={handleCardAdd} />
          <button
            onClick={() => setShowTierEditor(!showTierEditor)}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-sm transition"
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
              <TierRow key={tier.id} tier={tier} cards={getCardsForTier(tier.id)} onCardClick={setSelectedCard} />
            ))}
        </div>

        <UnsortedArea cards={getUnsortedCards()} onCardClick={setSelectedCard} />

        <DragOverlay>
          {activeCard ? (
            <div className="bg-gray-700 rounded p-2 text-sm shadow-xl opacity-90 w-[88px] h-[88px] flex items-center justify-center">
              {activeCard.title || '카드'}
            </div>
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
