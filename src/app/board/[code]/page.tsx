export const dynamic = 'force-dynamic';

import Board from '@/components/Board';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function BoardPage({ params }: Props) {
  const { code } = await params;
  return <Board shareCode={code} />;
}
