-- ==============================================================================
-- PolySkill - Migration 13: Fix Infinite Recursion in conversation_members RLS Policy
-- ==============================================================================

-- 1. Helper function with SECURITY DEFINER to bypass RLS when checking membership.
-- This completely breaks the circular reference that caused infinite recursion.
CREATE OR REPLACE FUNCTION public.is_conversation_member(conv_id UUID, u_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.conversation_members
        WHERE conversation_id = conv_id AND user_id = u_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Fix conversation_members SELECT policy
DROP POLICY IF EXISTS "Members can view membership" ON public.conversation_members;
CREATE POLICY "Members can view membership" 
ON public.conversation_members FOR SELECT USING (
    user_id = auth.uid() OR public.is_conversation_member(conversation_id)
);

-- 3. Ensure members can update their own last_read_at
DROP POLICY IF EXISTS "Members can update their own membership" ON public.conversation_members;
CREATE POLICY "Members can update their own membership"
ON public.conversation_members FOR UPDATE USING (
    user_id = auth.uid()
);

-- 4. Fix conversations SELECT policy to use the non-recursive function
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" 
ON public.conversations FOR SELECT USING (
    public.is_conversation_member(id)
);

-- 5. Fix messages policies to use the non-recursive function
DROP POLICY IF EXISTS "Conversation members can view messages" ON public.messages;
CREATE POLICY "Conversation members can view messages" 
ON public.messages FOR SELECT USING (
    public.is_conversation_member(conversation_id)
);

DROP POLICY IF EXISTS "Conversation members can send messages" ON public.messages;
CREATE POLICY "Conversation members can send messages" 
ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    public.is_conversation_member(conversation_id)
);

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';
