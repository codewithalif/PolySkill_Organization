-- ==============================================================================
-- PolySkill - Migration 11: Add type and teamPostId to team_invitations & team_id to conversations
-- ==============================================================================

-- 1. Ensure team_invitations has 'type' column ('invite' | 'join_request')
ALTER TABLE public.team_invitations
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('invite', 'join_request')) DEFAULT 'invite';

-- 2. Add team_id to conversations table if not exists (for optional team association)
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- 3. Add last_message preview cache to conversations for faster queries
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS last_message TEXT;

-- 4. Update RLS policies on team_invitations to allow students to submit join requests
DROP POLICY IF EXISTS "Team members or leaders can send invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Allow members to invite or users to request to join" ON public.team_invitations;
CREATE POLICY "Allow members to invite or users to request to join"
ON public.team_invitations FOR INSERT WITH CHECK (
    auth.uid() = from_user_id AND (
        type = 'join_request' OR
        EXISTS (SELECT 1 FROM public.team_members WHERE team_id = team_invitations.team_id AND user_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Invitations visible to recipient, sender, or team leader" ON public.team_invitations;
DROP POLICY IF EXISTS "Invitations visible to participant or leader" ON public.team_invitations;
CREATE POLICY "Invitations visible to participant or leader"
ON public.team_invitations FOR SELECT USING (
    auth.uid() = to_user_id OR 
    auth.uid() = from_user_id OR
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

DROP POLICY IF EXISTS "Recipient or sender can update invitation" ON public.team_invitations;
DROP POLICY IF EXISTS "Recipient, sender or leader can update invitation" ON public.team_invitations;
CREATE POLICY "Recipient, sender or leader can update invitation"
ON public.team_invitations FOR UPDATE USING (
    auth.uid() = to_user_id OR 
    auth.uid() = from_user_id OR
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

DROP POLICY IF EXISTS "Allow sender, recipient or leader to delete invitation" ON public.team_invitations;
CREATE POLICY "Allow sender, recipient or leader to delete invitation"
ON public.team_invitations FOR DELETE USING (
    auth.uid() = from_user_id OR
    auth.uid() = to_user_id OR
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
