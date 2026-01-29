
-- Enable RLS on all user-specific tables

-- 1. Books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own books" ON public.books;
CREATE POLICY "Users can manage their own books" ON public.books
    FOR ALL USING (auth.uid() = user_id);

-- 2. Chapters
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own chapters" ON public.chapters;
CREATE POLICY "Users can manage their own chapters" ON public.chapters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.books 
            WHERE books.id = chapters.book_id 
            AND books.user_id = auth.uid()
        )
    );

-- 3. Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
CREATE POLICY "Users can manage their own projects" ON public.projects
    FOR ALL USING (auth.uid() = user_id);

-- 4. Tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.tasks;
CREATE POLICY "Users can manage their own tasks" ON public.tasks
    FOR ALL USING (auth.uid() = user_id);

-- 5. Notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own notes" ON public.notes;
CREATE POLICY "Users can manage their own notes" ON public.notes
    FOR ALL USING (auth.uid() = user_id);

-- 6. Folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own folders" ON public.folders;
CREATE POLICY "Users can manage their own folders" ON public.folders
    FOR ALL USING (auth.uid() = user_id);

-- 7. Personal Resources
ALTER TABLE public.personal_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own resources" ON public.personal_resources;
CREATE POLICY "Users can manage their own resources" ON public.personal_resources
    FOR ALL USING (auth.uid() = user_id);

-- 8. Posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own posts" ON public.posts;
CREATE POLICY "Users can manage their own posts" ON public.posts
    FOR ALL USING (auth.uid() = user_id);

-- 9. Social Groups
ALTER TABLE public.social_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own social groups" ON public.social_groups;
CREATE POLICY "Users can manage their own social groups" ON public.social_groups
    FOR ALL USING (auth.uid() = user_id);

-- 10. Social Profiles
ALTER TABLE public.social_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own social profiles" ON public.social_profiles;
CREATE POLICY "Users can manage their own social profiles" ON public.social_profiles
    FOR ALL USING (auth.uid() = user_id);
