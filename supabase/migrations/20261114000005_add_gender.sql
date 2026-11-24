-- ==============================================================================
-- PolySkill - Migration 10: Add gender to profiles & trigger
-- ==============================================================================

-- 1. Add gender column to profiles table if it does not exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('Male', 'Female', 'Other'));

-- 2. Update handle_new_user() trigger function to capture gender on signup
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
        whatsapp_number,
        gender,
        institute,
        department,
        semester,
        role,
        experience_level,
        profile_completion
    ) VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        clean_username,
        new.email,
        new.raw_user_meta_data->>'whatsapp_number',
        new.raw_user_meta_data->>'gender',
        COALESCE(new.raw_user_meta_data->>'institute', 'Other'),
        COALESCE(new.raw_user_meta_data->>'department', 'Computer Science & Technology'),
        COALESCE(new.raw_user_meta_data->>'semester', '1st Semester'),
        'student',
        'Beginner',
        60
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        whatsapp_number = COALESCE(EXCLUDED.whatsapp_number, public.profiles.whatsapp_number),
        gender = COALESCE(EXCLUDED.gender, public.profiles.gender),
        institute = EXCLUDED.institute,
        department = EXCLUDED.department,
        semester = EXCLUDED.semester;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
