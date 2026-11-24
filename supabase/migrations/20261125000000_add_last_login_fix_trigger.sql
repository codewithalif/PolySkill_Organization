-- ==============================================================================
-- PolySkill - Migration 12: Add last_login_at to profiles & fix trigger
-- ==============================================================================

-- 1. Add last_login_at column if it does not exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- 2. Update the index on profiles to include last_login_at for fast queries
-- (index already exists on created_at, just add this)
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON public.profiles(last_login_at);

-- 3. Replace handle_new_user() trigger to capture ALL fields including
--    roll_number, whatsapp_number, and gender in one consistent function.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    clean_username TEXT;
    base_username TEXT;
    iter INTEGER := 0;
BEGIN
    base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'));
    IF length(base_username) < 3 THEN
        base_username := 'student_' || substr(new.id::text, 1, 6);
    END IF;

    clean_username := base_username;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = clean_username) LOOP
        iter := iter + 1;
        clean_username := base_username || '_' || iter;
    END LOOP;

    INSERT INTO public.profiles (
        id,
        full_name,
        username,
        email,
        roll_number,
        whatsapp_number,
        gender,
        institute,
        department,
        semester,
        role,
        experience_level,
        profile_completion,
        last_login_at
    ) VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        clean_username,
        new.email,
        new.raw_user_meta_data->>'roll_number',
        new.raw_user_meta_data->>'whatsapp_number',
        new.raw_user_meta_data->>'gender',
        COALESCE(new.raw_user_meta_data->>'institute', 'Other'),
        COALESCE(new.raw_user_meta_data->>'department', 'Computer Science & Technology'),
        COALESCE(new.raw_user_meta_data->>'semester', '1st Semester'),
        'student',
        'Beginner',
        60,
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name           = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        roll_number         = COALESCE(EXCLUDED.roll_number, public.profiles.roll_number),
        whatsapp_number     = COALESCE(EXCLUDED.whatsapp_number, public.profiles.whatsapp_number),
        gender              = COALESCE(EXCLUDED.gender, public.profiles.gender),
        institute           = COALESCE(EXCLUDED.institute, public.profiles.institute),
        department          = COALESCE(EXCLUDED.department, public.profiles.department),
        semester            = COALESCE(EXCLUDED.semester, public.profiles.semester),
        last_login_at       = timezone('utc'::text, now()),
        updated_at          = timezone('utc'::text, now());

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-create the trigger (safe – DROP IF EXISTS first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
