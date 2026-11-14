-- ==============================================================================
-- PolySkill - Migration 7: Dynamic Announcements System & Realtime Broadcasting
-- ==============================================================================

-- 1. Create announcements table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('General', 'Maintenance', 'Event', 'Feature', 'Important')) DEFAULT 'General',
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_announcements_published_date 
ON public.announcements(is_published, created_at DESC);

-- 3. Row Level Security (RLS)
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published announcements are viewable by everyone" ON public.announcements;
CREATE POLICY "Published announcements are viewable by everyone"
ON public.announcements FOR SELECT
USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can manage announcements" ON public.announcements;
CREATE POLICY "Only admins can manage announcements"
ON public.announcements FOR ALL
USING (public.is_admin());

-- 4. Enable Supabase Realtime for announcements table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'announcements'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
    END IF;
END $$;

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
