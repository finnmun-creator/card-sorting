'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Participant {
  deviceId: string;
  nickname: string;
}

interface Options {
  sessionId: string;
  deviceId: string;
  nickname: string;
}

export function usePresence({ sessionId, deviceId, nickname }: Options) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!sessionId || !deviceId) return;

    const channel = supabase.channel(`presence:${sessionId}`, {
      config: { presence: { key: deviceId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ deviceId: string; nickname: string }>();
        const list: Participant[] = [];
        for (const key in state) {
          const presences = state[key];
          if (presences && presences.length > 0) {
            list.push({
              deviceId: presences[0].deviceId,
              nickname: presences[0].nickname,
            });
          }
        }
        setParticipants(list);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ deviceId, nickname });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [sessionId, deviceId, nickname]);

  return { participants };
}
