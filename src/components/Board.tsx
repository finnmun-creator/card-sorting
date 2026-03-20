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
import { usePresence } from '@/hooks/usePresence';
import CaptureButton from './CaptureButton';
import NicknameModal from './NicknameModal';
import { getDevice, saveDevice } from '@/lib/device';
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
  const [device, setDevice] = useState<{ id: string; nickname: string } | null>(null);
  const [needsNickname, setNeedsNickname] = useState(false);
  const [cardDisplayMode, setCardDisplayMode] = useState<CardDisplayMode>('memo');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    const stored = getDevice();
    if (stored) {
      setDevice(stored);
    } else {
      setNeedsNickname(true);
    }
  }, []);

  const { participants } = usePresence({
    sessionId: board?.session.id ?? '',
    deviceId: device?.id ?? '',
    nickname: device?.nickname ?? '',
  });

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

  function handleNicknameSubmit(name: string) {
    const d = saveDevice(name);
    setDevice(d);
    setNeedsNickname(false);
  }

  if (loading) return <div className="text-center py-20 text-[var(--text-tertiary)] text-sm">보드 로딩 중...</div>;
  if (needsNickname) return <NicknameModal onSubmit={handleNicknameSubmit} />;
  if (!device) return <div className="text-center py-20 text-[var(--text-secondary)]">로딩 중...</div>;
  if (!board) return <div className="text-center py-20 text-red-400 text-sm">세션을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <a href="/" className="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition">Card Sorting</a>
          {participants.length > 0 && (
            <div className="flex items-center gap-1.5">
              {participants.map((p) => (
                <div
                  key={p.deviceId}
                  className="w-7 h-7 rounded-full bg-[var(--accent-primary)] text-white text-[10px] font-medium flex items-center justify-center"
                  title={p.nickname}
                >
                  {p.nickname.charAt(0).toUpperCase()}
                </div>
              ))}
              <span className="text-xs text-[var(--text-tertiary)] ml-0.5">{participants.length}명</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* 메모/이미지 토글 */}
          <div className="flex items-center border border-[var(--border-default)] rounded-md overflow-hidden h-9">
            <button
              onClick={() => setCardDisplayMode('memo')}
              className={`px-3 h-9 text-xs transition ${
                cardDisplayMode === 'memo'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              메모
            </button>
            <button
              onClick={() => setCardDisplayMode('image')}
              className={`px-3 h-9 text-xs transition ${
                cardDisplayMode === 'image'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              이미지
            </button>
          </div>
          {/* 티어 편집 (아이콘) */}
          <button
            onClick={() => setShowTierEditor(!showTierEditor)}
            className={`h-9 w-9 flex items-center justify-center rounded-md border transition ${
              showTierEditor
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-blue-50'
                : 'border-[var(--border-default)] bg-white text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
            }`}
            aria-label="티어 편집"
            title="티어 편집"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
          {/* 이미지 저장 */}
          <CaptureButton targetId="board-capture" />
          {/* 링크 복사 */}
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="bg-white border border-[var(--border-default)] hover:border-[var(--border-hover)] text-[var(--text-primary)] h-9 px-3 rounded-md text-sm transition"
          >
            링크 복사
          </button>
        </div>
      </div>

      {/* 티어 편집 패널 */}
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
          addButton={<AddCardButton sessionId={board.session.id} onAdd={handleCardAdd} />}
        />

        <DragOverlay>
          {activeCard ? (
            cardDisplayMode === 'image' ? (
              <div className="w-[130px] bg-white border border-[var(--border-default)] rounded-md overflow-hidden shadow-lg opacity-90">
                <div className="h-[85px] bg-[var(--bg-muted)]">
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
                className="w-[130px] h-[115px] rounded-md p-3 shadow-lg opacity-90 flex flex-col"
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
