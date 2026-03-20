export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Board from '@/components/Board';
import { getProjectByShareCode } from '@/lib/db-server';

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const project = await getProjectByShareCode(code);

  const title = project?.title ? `${project.title} — Card Sorting` : 'Card Sorting';
  const description = project?.description || '실시간 협업 카드소팅 서비스';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function BoardPage({ params }: Props) {
  const { code } = await params;
  return <Board shareCode={code} />;
}
