-- Admin-only site and SchoolCoin visit analytics.
CREATE TABLE IF NOT EXISTS public.site_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('site_visit', 'schoolcoin_visit')),
  visitor_id text NOT NULL CHECK (char_length(visitor_id) BETWEEN 8 AND 80),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_analytics_events ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.site_analytics_events TO anon, authenticated;
GRANT SELECT ON public.site_analytics_events TO authenticated;

DROP POLICY IF EXISTS "public_insert_analytics_events" ON public.site_analytics_events;
CREATE POLICY "public_insert_analytics_events" ON public.site_analytics_events
FOR INSERT TO anon, authenticated
WITH CHECK (event_type IN ('site_visit', 'schoolcoin_visit') AND char_length(visitor_id) BETWEEN 8 AND 80);

DROP POLICY IF EXISTS "admin_select_analytics_events" ON public.site_analytics_events;
CREATE POLICY "admin_select_analytics_events" ON public.site_analytics_events
FOR SELECT TO authenticated
USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_site_analytics_events_created_at ON public.site_analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_analytics_events_type_created_at ON public.site_analytics_events(event_type, created_at DESC);
