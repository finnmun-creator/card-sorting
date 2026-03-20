import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getProjectByShareCode(shareCode: string): Promise<{ title: string; description: string } | null> {
  const { data: session } = await supabase
    .from('sessions')
    .select('project_id')
    .eq('share_code', shareCode)
    .single();
  if (!session) return null;

  const { data: project } = await supabase
    .from('projects')
    .select('title, description')
    .eq('id', session.project_id)
    .single();
  return project ?? null;
}
