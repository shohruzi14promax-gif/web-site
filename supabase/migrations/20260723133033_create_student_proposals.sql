-- 1. Jadvalni to'g'ri ustun nomlari bilan yaratish
CREATE TABLE IF NOT EXISTS student_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry text NOT NULL,
  full_name text NOT NULL,
  class text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- 2. Xavfsizlik va RLS siyosatlarini faollashtirish
ALTER TABLE student_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_proposals" ON student_proposals;
CREATE POLICY "anon_select_proposals" ON student_proposals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_proposals" ON student_proposals;
CREATE POLICY "anon_insert_proposals" ON student_proposals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- 3. Indekslar
CREATE INDEX IF NOT EXISTS idx_student_proposals_ministry ON student_proposals(ministry);
CREATE INDEX IF NOT EXISTS idx_student_proposals_created_at ON student_proposals(created_at DESC);