'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Card, Tier } from '@/types';

export type BoardEvent =
  | { type: 'card_move'; cardId: string; tierId: string | null; sortOrder: number }
  | { type: 'card_add'; card: Card }
  | { type: 'card_update'; card: Card }
  | { type: 'card_delete'; cardId: string }
  | { type: 'tier_add'; tier: Tier }
  | { type: 'tier_update'; tier: Tier }
  | { type: 'tier_delete'; tierId: string }
  | { type: 'full_sync' };

interface Options {
  sessionId: string;
  onEvent: (event: BoardEvent) => void;
}

export function useRealtimeBoard({ sessionId, onEvent }: Options) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const channel = supabase.channel(`board:${sessionId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'board_event' }, ({ payload }) => {
        onEventRef.current(payload as BoardEvent);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [sessionId]);

  const broadcast = useCallback((event: BoardEvent) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'board_event',
      payload: event,
    });
  }, []);

  return { broadcast };
}
