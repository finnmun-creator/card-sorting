'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSessionByShareCode, getBoardState, moveCard, addParticipant, getParticipantsByShareCode, getProjectPasswordByShareCode } from '@/lib/db';
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
import PasswordGate from './PasswordGate';
import { getDevice, saveDevice, updateNickname } from '@/lib/device';
import type { CardDisplayMode } from './CardItem';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

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
  const [existingParticipants, setExistingParticipants] = useState<string[]>([]);
  const [cardDisplayMode, setCardDisplayMode] = useState<CardDisplayMode>('memo');
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [projectPassword, setProjectPassword] = useState<string | null>(null);
  const [passwordChecked, setPasswordChecked] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    const stored = getDevice();
    if (stored) {
      setDevice(stored);
    } else {
      setNeedsNickname(true);
      getParticipantsByShareCode(shareCode).then(setExistingParticipants).catch(() => {});
    }
    // Check if project is locked
    getProjectPasswordByShareCode(shareCode).then((pw) => {
      setProjectPassword(pw);
      if (!pw) setPasswordChecked(true);
    }).catch(() => setPasswordChecked(true));
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
    // 참여자 기록
    const d = getDevice();
    if (d && session.project_id) {
      addParticipant(session.project_id, d.nickname).catch(() => {});
    }
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
    if (cardId === overId) return;

    const currentCard = board.cards.find((c) => c.id === cardId);
    if (!currentCard) return;

    // Determine target tier
    let newTierId: string | null = null;
    if (overId === 'unsorted') {
      newTierId = null;
    } else {
      const targetTier = board.tiers.find((t) => t.id === overId);
      if (targetTier) {
        newTierId = targetTier.id;
      } else {
        const targetCard = board.cards.find((c) => c.id === overId);
        if (targetCard) {
          newTierId = targetCard.tier_id;
        }
      }
    }

    // Same tier: reorder using arrayMove (insert between, not swap)
    if (currentCard.tier_id === newTierId) {
      const tierCards = board.cards
        .filter((c) => c.tier_id === newTierId)
        .sort((a, b) => a.sort_order - b.sort_order);

      const oldIndex = tierCards.findIndex((c) => c.id === cardId);
      const newIndex = tierCards.findIndex((c) => c.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reordered = arrayMove(tierCards, oldIndex, newIndex);

      // Update local state
      const updatedCards = board.cards.map((c) => {
        const idx = reordered.findIndex((r) => r.id === c.id);
        if (idx !== -1) return { ...c, sort_order: idx };
        return c;
      });
      setBoard((prev) => prev ? { ...prev, cards: updatedCards } : prev);

      // Persist to DB
      for (let i = 0; i < reordered.length; i++) {
        if (reordered[i].sort_order !== i) {
          moveCard(reordered[i].id, newTierId, i);
        }
      }
      broadcast({ type: 'full_sync' });
      return;
    }

    // Cross-tier: move card to new tier
    // Find insertion index if dropping on a card
    const targetTierCards = board.cards
      .filter((c) => c.tier_id === newTierId && c.id !== cardId)
      .sort((a, b) => a.sort_order - b.sort_order);

    let insertIndex = targetTierCards.length; // default: end
    const overCard = board.cards.find((c) => c.id === overId);
    if (overCard) {
      const overIndex = targetTierCards.findIndex((c) => c.id === overId);
      if (overIndex !== -1) insertIndex = overIndex;
    }

    // Recompute sort orders for target tier
    const newTargetCards = [...targetTierCards];
    const movedCard = { ...currentCard, tier_id: newTierId, sort_order: insertIndex };
    newTargetCards.splice(insertIndex, 0, movedCard);

    // Update all cards' state
    const updatedCards = board.cards.map((c) => {
      if (c.id === cardId) return { ...c, tier_id: newTierId, sort_order: insertIndex };
      const idx = newTargetCards.findIndex((r) => r.id === c.id);
      if (idx !== -1) return { ...c, sort_order: idx };
      return c;
    });
    setBoard((prev) => prev ? { ...prev, cards: updatedCards } : prev);

    // Persist
    await moveCard(cardId, newTierId, insertIndex);
    // Update sort orders for displaced cards
    for (let i = 0; i < newTargetCards.length; i++) {
      if (newTargetCards[i].id !== cardId && newTargetCards[i].sort_order !== i) {
        moveCard(newTargetCards[i].id, newTierId, i);
      }
    }
    broadcast({ type: 'full_sync' });
  }

  useEffect(() => {
    if (device) setEditNickname(device.nickname);
  }, [device]);

  function handleNicknameSubmit(name: string) {
    const d = saveDevice(name);
    setDevice(d);
    setNeedsNickname(false);
  }

  function handleNicknameChange(name: string) {
    const d = updateNickname(name);
    setDevice(d);
    setShowProfileEditor(false);
  }

  if (loading) return <div className="text-center py-20 text-[var(--text-tertiary)] text-sm">보드 로딩 중...</div>;
  if (projectPassword && !passwordChecked) {
    return <PasswordGate
      onSuccess={() => setPasswordChecked(true)}
      checkPassword={(pw) => pw === projectPassword}
    />;
  }
  if (needsNickname) return <NicknameModal existingParticipants={existingParticipants} onSubmit={handleNicknameSubmit} />;
  if (!device) return <div className="text-center py-20 text-[var(--text-secondary)]">로딩 중...</div>;
  if (!board) return <div className="text-center py-20 text-red-400 text-sm">세션을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <a href="/" className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition">
          <img src="/icon.svg" alt="" className="w-7 h-7 rounded-md" />
          Card Sorting
        </a>
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

          {/* 티어 편집: 아이콘 + 텍스트 */}
          <button
            onClick={() => setShowTierEditor(!showTierEditor)}
            className={`h-9 flex items-center gap-1.5 px-3 rounded-md border text-sm transition ${
              showTierEditor
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-blue-50'
                : 'border-[var(--border-default)] bg-white text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            티어 편집
          </button>

          {/* 이미지 저장 */}
          <CaptureButton targetId="board-capture" />

          {/* 링크 복사 */}
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="bg-white border border-[var(--border-default)] hover:border-[var(--border-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-9 px-3 rounded-md text-sm transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
            </svg>
            링크 복사
          </button>

          {/* 참여자 아바타 (겹치기) */}
          {participants.length > 0 && (
            <>
              <div className="w-px h-6 bg-[var(--border-default)] mx-1" />
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {participants.slice(0, 4).map((p, i) => (
                    <div
                      key={p.deviceId}
                      className="w-8 h-8 rounded-full bg-[var(--accent-primary)] text-white text-[11px] font-medium flex items-center justify-center border-2 border-white cursor-pointer hover:scale-110 transition-transform"
                      style={{ zIndex: 4 - i }}
                      title={p.nickname}
                      onClick={() => setShowProfileEditor(true)}
                    >
                      {p.nickname.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {participants.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)] text-[11px] font-medium flex items-center justify-center border-2 border-white">
                      +{participants.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 프로필 편집 드롭다운 */}
      {showProfileEditor && (
        <div className="fixed inset-0 z-50" onClick={() => setShowProfileEditor(false)}>
          <div
            className="absolute top-14 right-4 bg-white rounded-lg shadow-lg border border-[var(--border-default)] p-4 w-64 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">내 프로필</h3>
            <div>
              <label className="text-xs text-[var(--text-secondary)]">닉네임</label>
              <input
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editNickname.trim()) {
                    handleNicknameChange(editNickname.trim());
                  }
                }}
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-3 py-2 mt-1 text-sm outline-none focus:border-[var(--accent-primary)]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowProfileEditor(false)}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] h-8 px-3"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (editNickname.trim()) handleNicknameChange(editNickname.trim());
                }}
                className="bg-[var(--accent-primary)] text-white text-sm h-8 px-4 rounded-md"
              >
                저장
              </button>
            </div>

            {/* 참여자 목록 */}
            <div className="border-t border-[var(--border-default)] pt-3 mt-3">
              <h4 className="text-xs text-[var(--text-tertiary)] mb-2">접속 중 ({participants.length}명)</h4>
              <div className="space-y-1.5">
                {participants.map((p) => (
                  <div key={p.deviceId} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white text-[9px] font-medium flex items-center justify-center">
                      {p.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-[var(--text-primary)]">
                      {p.nickname}{p.deviceId === device?.id ? ' (나)' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 티어 편집 패널 */}
      {showTierEditor && (
        <div className="mb-4">
          <TierEditor tiers={board.tiers} sessionId={board.session.id} onUpdate={() => { loadBoard(); broadcast({ type: 'full_sync' }); }} />
        </div>
      )}

      {/* 보드 */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
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
