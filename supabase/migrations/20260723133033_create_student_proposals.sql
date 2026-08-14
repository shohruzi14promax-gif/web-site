-- Student proposals: public can submit, only admin users can read/manage.
CREATE TABLE IF NOT EXISTS student_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry text NOT NULL,
  full_name text NOT NULL,
  class text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE student_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_proposals" ON student_proposals;
DROP POLICY IF EXISTS "anon_insert_proposals" ON student_proposals;
DROP POLICY IF EXISTS "admin_select_proposals" ON student_proposals;
DROP POLICY IF EXISTS "admin_update_proposals" ON student_proposals;
DROP POLICY IF EXISTS "admin_delete_proposals" ON student_proposals;

-- Anyone may submit a proposal. Reading is intentionally blocked for anon users.
CREATE POLICY "anon_insert_proposals"
  ON student_proposals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only Supabase Auth users explicitly marked with app_metadata.role = admin may read.
CREATE POLICY "admin_select_proposals"
  ON student_proposals FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_update_proposals"
  ON student_proposals FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_delete_proposals"
  ON student_proposals FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_student_proposals_ministry ON student_proposals(ministry);
CREATE INDEX IF NOT EXISTS idx_student_proposals_created_at ON student_proposals(created_at DESC);
