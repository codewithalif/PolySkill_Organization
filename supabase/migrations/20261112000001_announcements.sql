-- ==============================================================================
-- PolySkill - Migration 2: Announcements Table & Policies
-- ==============================================================================

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

CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published, created_at DESC);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published announcements are viewable by everyone" ON public.announcements;
CREATE POLICY "Published announcements are viewable by everyone"
ON public.announcements FOR SELECT
USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can manage announcements" ON public.announcements;
CREATE POLICY "Only admins can manage announcements"
ON public.announcements FOR ALL
USING (public.is_admin());
