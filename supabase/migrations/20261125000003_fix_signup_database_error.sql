-- ==============================================================================
-- PolySkill - Migration 15: Fix "Database error saving new user" on signup
-- ==============================================================================

-- 1. Ensure all columns referenced by trigger and auth actions exist on public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- 2. Drop problematic BEFORE INSERT trigger on auth.users if present
-- Modifying NEW.confirmed_at in BEFORE INSERT triggers causes GoTrue 500 errors in recent Supabase versions
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;

-- 3. Replace handle_new_user() with an exception-resilient function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    clean_username TEXT;
    base_username TEXT;
    iter INTEGER := 0;
BEGIN
    -- Derive a clean base username from email or metadata
    base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'));
    IF length(base_username) < 3 THEN
        base_username := 'student_' || substr(new.id::text, 1, 6);
    END IF;

    clean_username := base_username;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = clean_username) LOOP
        iter := iter + 1;
        clean_username := base_username || '_' || iter;
    END LOOP;

    -- Insert profile safely
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
EXCEPTION WHEN OTHERS THEN
    -- Prevent signup failure even if profile insertion encounters an unexpected constraint.
    -- The application code will fallback and populate the profile on first session/login.
    RAISE WARNING 'handle_new_user error: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Reattach the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
