-- ==============================================================================
-- PolySkill - Migration 8: Add Facebook and Instagram profile URLs
-- ==============================================================================

-- 1. Add facebook_url and instagram_url columns to profiles table if they do not exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- 2. Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
