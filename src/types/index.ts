export interface Project {
  id: string;
  title: string;
  creator_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  project_id: string;
  share_code: string;
  created_at: string;
}

export interface Tier {
  id: string;
  session_id: string;
  label: string;
  color: string;
  sort_order: number;
}

export interface Card {
  id: string;
  session_id: string;
  tier_id: string | null;
  title: string;
  description: string;
  image_url: string | null;
  tags: string[];
  source: string;
  sort_order: number;
  created_at: string;
}

export interface BoardState {
  session: Session;
  tiers: Tier[];
  cards: Card[];
}
