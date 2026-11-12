-- ==============================================================================
-- PolySkill - Complete PostgreSQL Database Schema & Migrations (Safe Re-runnable)
-- ==============================================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- Table 1: profiles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    institute TEXT NOT NULL,
    department TEXT NOT NULL,
    semester TEXT NOT NULL,
    bio TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    experience_level TEXT NOT NULL CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
    role TEXT NOT NULL CHECK (role IN ('student', 'admin')) DEFAULT 'student',
    profile_completion INTEGER NOT NULL DEFAULT 60 CHECK (profile_completion >= 0 AND profile_completion <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_institute ON public.profiles(institute);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);

-- ==============================================================================
-- Table 2: skills (Catalog)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);

-- ==============================================================================
-- Table 3: student_skills
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')) DEFAULT 'Beginner',
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    target_date DATE,
    learning_goal TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_skill UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_student_skills_user ON public.student_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_name ON public.student_skills(name);

-- ==============================================================================
-- Table 4: projects
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url TEXT,
    tech_stack TEXT[] NOT NULL DEFAULT '{}',
    github_url TEXT,
    live_url TEXT,
    category TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Planning', 'In Progress', 'Completed', 'On Hold')) DEFAULT 'Planning',
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    team_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- ==============================================================================
-- Table 5: project_likes
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.project_likes (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (project_id, user_id)
);

-- ==============================================================================
-- Table 6: project_bookmarks
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.project_bookmarks (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (project_id, user_id)
);

-- ==============================================================================
-- Table 7: project_comments
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.project_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_comments_project ON public.project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.project_comments(author_id);

-- ==============================================================================
-- Table 8: teams
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('Planning', 'Recruiting', 'In Progress', 'Completed')) DEFAULT 'Recruiting',
    max_members INTEGER NOT NULL DEFAULT 5 CHECK (max_members >= 2 AND max_members <= 20),
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_teams_created_by ON public.teams(created_by);
CREATE INDEX IF NOT EXISTS idx_teams_status ON public.teams(status);

-- Add Foreign Key from projects to teams
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_projects_team' AND table_name = 'projects'
    ) THEN
        ALTER TABLE public.projects 
        ADD CONSTRAINT fk_projects_team 
        FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ==============================================================================
-- Table 9: team_members
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'Member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_team_member UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);

-- ==============================================================================
-- Table 10: team_invitations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_invitations_to_user ON public.team_invitations(to_user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_team ON public.team_invitations(team_id);

-- ==============================================================================
-- Table 11: conversations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Table 12: conversation_members
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.conversation_members (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_members_user ON public.conversation_members(user_id);

-- ==============================================================================
-- Table 13: messages
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

-- ==============================================================================
-- Table 14: roadmaps
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Code',
    estimated_duration TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_slug ON public.roadmaps(slug);

-- ==============================================================================
-- Table 15: roadmap_steps
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.roadmap_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    topics TEXT[] NOT NULL DEFAULT '{}',
    resources JSONB NOT NULL DEFAULT '[]'::jsonb,
    step_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_roadmap_step_order UNIQUE(roadmap_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_steps_roadmap ON public.roadmap_steps(roadmap_id, step_order ASC);

-- ==============================================================================
-- Table 16: student_roadmap_progress
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_roadmap_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES public.roadmap_steps(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT true,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_roadmap_step UNIQUE(user_id, step_id)
);

CREATE INDEX IF NOT EXISTS idx_student_roadmap_progress_user ON public.student_roadmap_progress(user_id);

-- ==============================================================================
-- Table 17: notifications
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('invitation', 'message', 'team', 'project', 'system')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);

-- ==============================================================================
-- Table 18: reports
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('project', 'user', 'comment')),
    reason TEXT NOT NULL,
    reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'resolved', 'dismissed')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- ==============================================================================
-- Trigger Function: Automatic Profile Creation On User Signup
-- ==============================================================================
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
        COALESCE(new.raw_user_meta_data->>'institute', 'Other'),
        COALESCE(new.raw_user_meta_data->>'department', 'Computer Science & Technology'),
        COALESCE(new.raw_user_meta_data->>'semester', '1st Semester'),
        'student',
        'Beginner',
        60
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        institute = EXCLUDED.institute,
        department = EXCLUDED.department,
        semester = EXCLUDED.semester;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- Helper Function: Check If Current User Is Admin
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (DROP IF EXISTS then CREATE)
-- ==============================================================================

-- 1. profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. skills (Catalog)
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Skills catalog is viewable by everyone" ON public.skills;
CREATE POLICY "Skills catalog is viewable by everyone" 
ON public.skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert or manage skills catalog" ON public.skills;
CREATE POLICY "Admins can insert or manage skills catalog" 
ON public.skills FOR ALL USING (public.is_admin());

-- 3. student_skills
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Student skills are viewable by everyone" ON public.student_skills;
CREATE POLICY "Student skills are viewable by everyone" 
ON public.student_skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can manage their own skills" ON public.student_skills;
CREATE POLICY "Students can manage their own skills" 
ON public.student_skills FOR ALL USING (auth.uid() = user_id);

-- 4. projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;
CREATE POLICY "Projects are viewable by everyone" 
ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
CREATE POLICY "Authenticated users can create projects" 
ON public.projects FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Project owners or admins can update projects" ON public.projects;
CREATE POLICY "Project owners or admins can update projects" 
ON public.projects FOR UPDATE USING (auth.uid() = created_by OR public.is_admin());

DROP POLICY IF EXISTS "Project owners or admins can delete projects" ON public.projects;
CREATE POLICY "Project owners or admins can delete projects" 
ON public.projects FOR DELETE USING (auth.uid() = created_by OR public.is_admin());

-- 5. project_likes
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Project likes are viewable by everyone" ON public.project_likes;
CREATE POLICY "Project likes are viewable by everyone" 
ON public.project_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can toggle like" ON public.project_likes;
CREATE POLICY "Authenticated users can toggle like" 
ON public.project_likes FOR ALL USING (auth.uid() = user_id);

-- 6. project_bookmarks
ALTER TABLE public.project_bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only view their own bookmarks" ON public.project_bookmarks;
CREATE POLICY "Users can only view their own bookmarks" 
ON public.project_bookmarks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can manage their own bookmarks" ON public.project_bookmarks;
CREATE POLICY "Authenticated users can manage their own bookmarks" 
ON public.project_bookmarks FOR ALL USING (auth.uid() = user_id);

-- 7. project_comments
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.project_comments;
CREATE POLICY "Comments are viewable by everyone" 
ON public.project_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.project_comments;
CREATE POLICY "Authenticated users can create comments" 
ON public.project_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Comment authors or admins can delete/update comments" ON public.project_comments;
CREATE POLICY "Comment authors or admins can delete/update comments" 
ON public.project_comments FOR ALL USING (auth.uid() = author_id OR public.is_admin());

-- 8. teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teams are viewable by everyone" ON public.teams;
CREATE POLICY "Teams are viewable by everyone" 
ON public.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams" 
ON public.teams FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team leader can update team" ON public.teams;
CREATE POLICY "Team leader can update team" 
ON public.teams FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team leader or admin can delete team" ON public.teams;
CREATE POLICY "Team leader or admin can delete team" 
ON public.teams FOR DELETE USING (auth.uid() = created_by OR public.is_admin());

-- 9. team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team members are viewable by everyone" ON public.team_members;
CREATE POLICY "Team members are viewable by everyone" 
ON public.team_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Team leader can manage members or user can leave team" ON public.team_members;
CREATE POLICY "Team leader can manage members or user can leave team" 
ON public.team_members FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid()) OR
    public.is_admin()
);

-- 10. team_invitations
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Invitations visible to recipient, sender, or team leader" ON public.team_invitations;
CREATE POLICY "Invitations visible to recipient, sender, or team leader" 
ON public.team_invitations FOR SELECT USING (
    auth.uid() = to_user_id OR 
    auth.uid() = from_user_id OR
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

DROP POLICY IF EXISTS "Team members or leaders can send invitations" ON public.team_invitations;
CREATE POLICY "Team members or leaders can send invitations" 
ON public.team_invitations FOR INSERT WITH CHECK (
    auth.uid() = from_user_id AND
    EXISTS (SELECT 1 FROM public.team_members WHERE team_id = team_invitations.team_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Recipient or sender can update invitation" ON public.team_invitations;
CREATE POLICY "Recipient or sender can update invitation" 
ON public.team_invitations FOR UPDATE USING (
    auth.uid() = to_user_id OR auth.uid() = from_user_id
);

-- 11. conversations & conversation_members
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" 
ON public.conversations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_members 
        WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Members can view membership" ON public.conversation_members;
CREATE POLICY "Members can view membership" 
ON public.conversation_members FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_members AS cm 
        WHERE cm.conversation_id = conversation_members.conversation_id AND cm.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Authenticated users can add members to conversation" ON public.conversation_members;
CREATE POLICY "Authenticated users can add members to conversation" 
ON public.conversation_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 12. messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Conversation members can view messages" ON public.messages;
CREATE POLICY "Conversation members can view messages" 
ON public.messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversation_members 
        WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Conversation members can send messages" ON public.messages;
CREATE POLICY "Conversation members can send messages" 
ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.conversation_members 
        WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
);

-- 13. roadmaps & roadmap_steps
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Roadmaps viewable by everyone" ON public.roadmaps;
CREATE POLICY "Roadmaps viewable by everyone" 
ON public.roadmaps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage roadmaps" ON public.roadmaps;
CREATE POLICY "Admins can manage roadmaps" 
ON public.roadmaps FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Roadmap steps viewable by everyone" ON public.roadmap_steps;
CREATE POLICY "Roadmap steps viewable by everyone" 
ON public.roadmap_steps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage roadmap steps" ON public.roadmap_steps;
CREATE POLICY "Admins can manage roadmap steps" 
ON public.roadmap_steps FOR ALL USING (public.is_admin());

-- 14. student_roadmap_progress
ALTER TABLE public.student_roadmap_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their roadmap progress" ON public.student_roadmap_progress;
CREATE POLICY "Users can manage their roadmap progress" 
ON public.student_roadmap_progress FOR ALL USING (auth.uid() = user_id);

-- 15. notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only view their own notifications" ON public.notifications;
CREATE POLICY "Users can only view their own notifications" 
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" 
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users or triggers can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users or triggers can insert notifications" 
ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 16. reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can submit reports" ON public.reports;
CREATE POLICY "Authenticated users can submit reports" 
ON public.reports FOR INSERT WITH CHECK (auth.uid() = reported_by);

DROP POLICY IF EXISTS "Only admins can view and manage reports" ON public.reports;
CREATE POLICY "Only admins can view and manage reports" 
ON public.reports FOR ALL USING (public.is_admin());

-- ==============================================================================
-- Supabase Storage Buckets Configuration
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('project-thumbnails', 'project-thumbnails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('project-documents', 'project-documents', false, 20971520, ARRAY['application/pdf', 'application/zip', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public avatars viewable by all" ON storage.objects;
CREATE POLICY "Public avatars viewable by all"
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE USING (
    bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Public thumbnails viewable by all" ON storage.objects;
CREATE POLICY "Public thumbnails viewable by all"
ON storage.objects FOR SELECT USING (bucket_id = 'project-thumbnails');

DROP POLICY IF EXISTS "Users can upload project thumbnails" ON storage.objects;
CREATE POLICY "Users can upload project thumbnails"
ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'project-thumbnails' AND auth.role() = 'authenticated'
);

-- ==============================================================================
-- Initial Seed: Default Roadmaps and Skills Catalog
-- ==============================================================================
INSERT INTO public.skills (name, category) VALUES
    ('React', 'Frontend Development'),
    ('Next.js', 'Frontend Development'),
    ('TypeScript', 'Programming Languages'),
    ('JavaScript', 'Programming Languages'),
    ('Node.js', 'Backend Development'),
    ('PostgreSQL', 'Database'),
    ('Tailwind CSS', 'Frontend Development'),
    ('Python', 'Programming Languages'),
    ('FastAPI', 'Backend Development'),
    ('Docker', 'DevOps'),
    ('Git & GitHub', 'DevOps'),
    ('Figma', 'UI/UX Design')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.roadmaps (slug, title, description, icon, estimated_duration, difficulty) VALUES
    (
        'web-development', 
        'Full Stack Web Development', 
        'Complete guide for polytechnic students from HTML/CSS to Next.js and PostgreSQL backend.', 
        'Code', 
        '6 Months', 
        'Beginner'
    ),
    (
        'mobile-development', 
        'Flutter & React Native App Dev', 
        'Step-by-step roadmap to build cross-platform mobile apps for Android and iOS.', 
        'Smartphone', 
        '4 Months', 
        'Intermediate'
    ),
    (
        'cyber-security', 
        'Cyber Security & Ethical Hacking', 
        'Foundational roadmap for network defense, penetration testing, and web security.', 
        'Shield', 
        '5 Months', 
        'Intermediate'
    )
ON CONFLICT (slug) DO NOTHING;
