-- Projects: 프로젝트 단위 관리
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '새 프로젝트',
  creator_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions: 프로젝트 내 카드소팅 세션
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  share_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tiers: 세션 내 티어 행
CREATE TABLE tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'New Tier',
  color TEXT NOT NULL DEFAULT '#808080',
  sort_order INT NOT NULL DEFAULT 0
);

-- Cards: 세션 내 카드
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES tiers(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sessions_share_code ON sessions(share_code);
CREATE INDEX idx_tiers_session ON tiers(session_id);
CREATE INDEX idx_cards_session ON cards(session_id);
CREATE INDEX idx_cards_tier ON cards(tier_id);

-- RLS 활성화
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- 공개 읽기/쓰기 정책 (링크 공유 방식이므로 인증 없이 접근 허용)
CREATE POLICY "public_access" ON projects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_access" ON sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_access" ON tiers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_access" ON cards FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
