ALTER TABLE public.servers
  ADD COLUMN IF NOT EXISTS last_milestone_notified integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS member_count_synced_at timestamptz;

CREATE TABLE IF NOT EXISTS public.server_member_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
  recorded_on date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  member_count integer NOT NULL DEFAULT 0,
  online_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (server_id, recorded_on)
);

GRANT SELECT ON public.server_member_stats TO anon;
GRANT SELECT ON public.server_member_stats TO authenticated;
GRANT ALL ON public.server_member_stats TO service_role;

ALTER TABLE public.server_member_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Member stats are viewable by everyone"
  ON public.server_member_stats FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_server_member_stats_server ON public.server_member_stats(server_id, recorded_on DESC);