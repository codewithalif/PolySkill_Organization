-- ==============================================================================
-- PolySkill - Migration 14: Fix "new row violates row-level security policy for table conversations"
-- ==============================================================================

-- 1. Add created_by column to conversations (defaults to currently logged-in user)
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) DEFAULT auth.uid();

-- 2. Ensure is_conversation_member helper function exists (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_conversation_member(conv_id UUID, u_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.conversation_members
        WHERE conversation_id = conv_id AND user_id = u_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Fix conversations SELECT policy:
-- The creator can immediately view the newly created conversation (needed for RETURNING id on INSERT)
-- and existing members can view their conversations.
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" 
ON public.conversations FOR SELECT USING (
    auth.uid() = created_by OR public.is_conversation_member(id)
);

-- 4. Fix conversations INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
);

-- 5. Fix conversations UPDATE policy (e.g. for last_message preview or team_id)
DROP POLICY IF EXISTS "Members can update conversations" ON public.conversations;
CREATE POLICY "Members can update conversations" 
ON public.conversations FOR UPDATE USING (
    auth.uid() = created_by OR public.is_conversation_member(id)
);

-- 6. Fix conversation_members policies
DROP POLICY IF EXISTS "Members can view membership" ON public.conversation_members;
CREATE POLICY "Members can view membership" 
ON public.conversation_members FOR SELECT USING (
    user_id = auth.uid() OR public.is_conversation_member(conversation_id)
);

DROP POLICY IF EXISTS "Authenticated users can add members to conversation" ON public.conversation_members;
CREATE POLICY "Authenticated users can add members to conversation" 
ON public.conversation_members FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Members can update their own membership" ON public.conversation_members;
CREATE POLICY "Members can update their own membership" 
ON public.conversation_members FOR UPDATE USING (
    user_id = auth.uid()
);

-- 7. High-Performance Atomic RPC Function: create_direct_conversation
-- Creates or retrieves a 1-on-1 direct conversation cleanly in a single transaction.
CREATE OR REPLACE FUNCTION public.create_direct_conversation(other_user_id UUID)
RETURNS UUID AS $$
DECLARE
    new_conv_id UUID;
    caller_id UUID := auth.uid();
BEGIN
    IF caller_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF caller_id = other_user_id THEN
        RAISE EXCEPTION 'Cannot message yourself';
    END IF;

    -- Check if conversation already exists between these two users
    SELECT cm1.conversation_id INTO new_conv_id
    FROM public.conversation_members cm1
    JOIN public.conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
    WHERE cm1.user_id = caller_id AND cm2.user_id = other_user_id
    LIMIT 1;

    IF new_conv_id IS NOT NULL THEN
        RETURN new_conv_id;
    END IF;

    -- Create new conversation with created_by = caller_id
    INSERT INTO public.conversations (id, created_by)
    VALUES (gen_random_uuid(), caller_id)
    RETURNING id INTO new_conv_id;

    -- Add both members atomically
    INSERT INTO public.conversation_members (conversation_id, user_id)
    VALUES 
        (new_conv_id, caller_id),
        (new_conv_id, other_user_id);

    RETURN new_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
