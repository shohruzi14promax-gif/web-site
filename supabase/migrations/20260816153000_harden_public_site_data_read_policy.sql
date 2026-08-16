-- Restrict public site_data reads to explicitly public content keys.
-- Sensitive/future-facing records (birthdays and GPA) remain admin-only.
DROP POLICY IF EXISTS "public read site data" ON public.site_data;

CREATE POLICY "public read non_sensitive site data"
ON public.site_data
FOR SELECT
TO anon, authenticated
USING (key NOT IN ('birthdays', 'gpaList'));

CREATE POLICY "admin read all site data"
ON public.site_data
FOR SELECT
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
