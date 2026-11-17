-- ==============================================================================
-- PolySkill - Migration 9: Auto-confirm users & confirm existing unconfirmed users
-- ==============================================================================

-- 1. Confirm any currently registered users whose email is unconfirmed
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- 2. Create trigger to auto-confirm new signups at the database level
-- This guarantees that even if Supabase settings have email confirmation toggled on,
-- any newly signed up user is immediately marked as confirmed without needing an email.
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, now());
    NEW.confirmed_at := COALESCE(NEW.confirmed_at, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_confirm_new_user();

-- 3. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
