-- Central persistent site data + secure admin authorization.
CREATE TABLE IF NOT EXISTS public.site_data (
  key text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_data ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.site_data TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_data TO authenticated;
DROP POLICY IF EXISTS "public_read_site_data" ON public.site_data;
CREATE POLICY "public_read_site_data" ON public.site_data FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_site_data" ON public.site_data;
CREATE POLICY "admin_insert_site_data" ON public.site_data FOR INSERT TO authenticated WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "admin_update_site_data" ON public.site_data;
CREATE POLICY "admin_update_site_data" ON public.site_data FOR UPDATE TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "admin_delete_site_data" ON public.site_data;
CREATE POLICY "admin_delete_site_data" ON public.site_data FOR DELETE TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE INDEX IF NOT EXISTS idx_site_data_updated_at ON public.site_data(updated_at DESC);

-- Visitors can submit proposals; only admins can read/change/delete them.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_proposals TO authenticated;
GRANT INSERT ON public.student_proposals TO anon;
ALTER TABLE public.student_proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_proposals" ON public.student_proposals;
DROP POLICY IF EXISTS "admin_select_proposals" ON public.student_proposals;
CREATE POLICY "admin_select_proposals" ON public.student_proposals FOR SELECT TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "admin_update_proposals" ON public.student_proposals;
CREATE POLICY "admin_update_proposals" ON public.student_proposals FOR UPDATE TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "admin_delete_proposals" ON public.student_proposals;
CREATE POLICY "admin_delete_proposals" ON public.student_proposals FOR DELETE TO authenticated USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
DROP POLICY IF EXISTS "anon_insert_proposals" ON public.student_proposals;
CREATE POLICY "anon_insert_proposals" ON public.student_proposals FOR INSERT TO anon, authenticated WITH CHECK (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.site_data;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
