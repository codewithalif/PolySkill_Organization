-- ==============================================================================
-- PolySkill - Migration 6: Support Sub-Admin Role & Admin Profile Deletion
-- ==============================================================================

-- 1. Update the role CHECK constraint on public.profiles to allow 'sub-admin'
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.profiles'::regclass 
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%role%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'sub-admin', 'admin'));

-- 2. Update is_admin() function to treat both 'admin' and 'sub-admin' as privileged users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'sub-admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Allow admins and sub-admins to delete student profiles
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE USING (public.is_admin());

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
