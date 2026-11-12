-- ==============================================================================
-- PolySkill - Migration 3: Course Lessons & Student Progress
-- ==============================================================================

-- 1. Course Lessons Table
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID REFERENCES public.roadmap_steps(id) ON DELETE CASCADE,
    playlist_id TEXT NOT NULL,
    serial INTEGER NOT NULL,
    title TEXT NOT NULL,
    video_id TEXT NOT NULL,
    url TEXT NOT NULL,
    duration TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_playlist_serial UNIQUE(playlist_id, serial)
);

CREATE INDEX IF NOT EXISTS idx_course_lessons_playlist ON public.course_lessons(playlist_id, serial ASC);
CREATE INDEX IF NOT EXISTS idx_course_lessons_step ON public.course_lessons(step_id);

-- 2. Student Lesson Progress Table
CREATE TABLE IF NOT EXISTS public.student_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT true,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_lesson UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_user ON public.student_lesson_progress(user_id);

-- Enable RLS
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS for course_lessons
DROP POLICY IF EXISTS "Course lessons viewable by everyone" ON public.course_lessons;
CREATE POLICY "Course lessons viewable by everyone"
ON public.course_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage course lessons" ON public.course_lessons;
CREATE POLICY "Only admins can manage course lessons"
ON public.course_lessons FOR ALL USING (public.is_admin());

-- RLS for student_lesson_progress
DROP POLICY IF EXISTS "Students can view their own lesson progress" ON public.student_lesson_progress;
CREATE POLICY "Students can view their own lesson progress"
ON public.student_lesson_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can insert their own lesson progress" ON public.student_lesson_progress;
CREATE POLICY "Students can insert their own lesson progress"
ON public.student_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can update their own lesson progress" ON public.student_lesson_progress;
CREATE POLICY "Students can update their own lesson progress"
ON public.student_lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- 3. Seed: Link step to HTML skill in Web Development Roadmap
DO $$
DECLARE
    web_roadmap_id UUID;
    html_step_id UUID;
BEGIN
    SELECT id INTO web_roadmap_id FROM public.roadmaps WHERE slug = 'web-development' LIMIT 1;
    
    IF web_roadmap_id IS NOT NULL THEN
        -- Check if HTML step exists
        SELECT id INTO html_step_id FROM public.roadmap_steps 
        WHERE roadmap_id = web_roadmap_id AND title ILIKE '%HTML%' LIMIT 1;

        -- If not exists, insert HTML as Step 1
        IF html_step_id IS NULL THEN
            INSERT INTO public.roadmap_steps (roadmap_id, title, description, topics, step_order, resources)
            VALUES (
                web_roadmap_id,
                'HTML5 - Structure of the Web',
                'Master HTML5 tags, elements, semantic structure, forms, and W3C validation through the official PolySkill playlist.',
                ARRAY['HTML Syntax', 'Semantic Tags', 'Tables & Lists', 'Forms & Inputs', 'Multimedia', 'W3C Validation'],
                1,
                '[{"title": "Official HTML Playlist", "url": "/roadmaps/web-development/html", "type": "course"}]'::jsonb
            )
            RETURNING id INTO html_step_id;
        END IF;
    END IF;
END $$;
