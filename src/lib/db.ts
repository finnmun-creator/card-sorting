import { supabase } from './supabase';
import { nanoid } from 'nanoid';
import type { Project, Session, Tier, Card, BoardState } from '@/types';

const DEFAULT_TIERS = [
  { label: 'S', color: '#FF7F7F', sort_order: 0 },
  { label: 'A', color: '#FFBF7F', sort_order: 1 },
  { label: 'B', color: '#FFDF7F', sort_order: 2 },
  { label: 'C', color: '#FFFF7F', sort_order: 3 },
  { label: 'D', color: '#7FBFFF', sort_order: 4 },
  { label: 'F', color: '#FF7FBF', sort_order: 5 },
];

// --- Projects ---

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createProject(title: string, description: string = ''): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ title, description })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addParticipant(projectId: string, nickname: string): Promise<void> {
  const { data } = await supabase
    .from('projects')
    .select('participants')
    .eq('id', projectId)
    .single();
  const current: string[] = data?.participants ?? [];
  if (!current.includes(nickname)) {
    const { error } = await supabase
      .from('projects')
      .update({ participants: [...current, nickname] })
      .eq('id', projectId);
    if (error) throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

export async function updateProject(id: string, updates: Partial<Pick<Project, 'title' | 'description'>>): Promise<void> {
  const { error } = await supabase.from('projects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function setProjectPassword(projectId: string, password: string | null): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ password, updated_at: new Date().toISOString() })
    .eq('id', projectId);
  if (error) throw error;
}

export async function getProjectPasswordByShareCode(shareCode: string): Promise<string | null> {
  const session = await getSessionByShareCode(shareCode);
  if (!session) return null;
  const { data } = await supabase
    .from('projects')
    .select('password')
    .eq('id', session.project_id)
    .single();
  return data?.password ?? null;
}

// --- Sessions ---

export async function createSession(projectId: string): Promise<Session> {
  const shareCode = nanoid(10);
  const { data, error } = await supabase
    .from('sessions')
    .insert({ project_id: projectId, share_code: shareCode })
    .select()
    .single();
  if (error) throw error;

  const tiersToInsert = DEFAULT_TIERS.map((t) => ({
    ...t,
    session_id: data.id,
  }));
  const { error: tierError } = await supabase.from('tiers').insert(tiersToInsert);
  if (tierError) throw tierError;

  return data;
}

export async function getSessionByShareCode(shareCode: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('share_code', shareCode)
    .single();
  if (error) return null;
  return data;
}

export async function getParticipantsByShareCode(shareCode: string): Promise<string[]> {
  const session = await getSessionByShareCode(shareCode);
  if (!session) return [];
  const { data } = await supabase
    .from('projects')
    .select('participants')
    .eq('id', session.project_id)
    .single();
  return data?.participants ?? [];
}

export async function getSessionsByProject(projectId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Board State ---

export async function getBoardState(sessionId: string): Promise<BoardState | null> {
  const [sessionRes, tiersRes, cardsRes] = await Promise.all([
    supabase.from('sessions').select('*').eq('id', sessionId).single(),
    supabase.from('tiers').select('*').eq('session_id', sessionId).order('sort_order'),
    supabase.from('cards').select('*').eq('session_id', sessionId).order('sort_order'),
  ]);
  if (sessionRes.error) return null;
  return {
    session: sessionRes.data,
    tiers: tiersRes.data ?? [],
    cards: cardsRes.data ?? [],
  };
}

// --- Tiers ---

export async function addTier(sessionId: string, label: string, color: string, sortOrder: number): Promise<Tier> {
  const { data, error } = await supabase
    .from('tiers')
    .insert({ session_id: sessionId, label, color, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTier(id: string, updates: Partial<Pick<Tier, 'label' | 'color' | 'sort_order'>>): Promise<void> {
  const { error } = await supabase.from('tiers').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteTier(id: string): Promise<void> {
  await supabase.from('cards').update({ tier_id: null }).eq('tier_id', id);
  const { error } = await supabase.from('tiers').delete().eq('id', id);
  if (error) throw error;
}

// --- Cards ---

export async function addCard(sessionId: string, card: Partial<Card>): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .insert({ session_id: sessionId, ...card })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCard(id: string, updates: Partial<Card>): Promise<void> {
  const { error } = await supabase.from('cards').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('id', id);
  if (error) throw error;
}

export async function moveCard(cardId: string, tierId: string | null, sortOrder: number): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({ tier_id: tierId, sort_order: sortOrder })
    .eq('id', cardId);
  if (error) throw error;
}

// --- Image Upload ---

export async function uploadCardImage(sessionId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const path = `${sessionId}/${nanoid(8)}.${ext}`;
  const { error } = await supabase.storage
    .from('card-images')
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('card-images').getPublicUrl(path);
  return data.publicUrl;
}
