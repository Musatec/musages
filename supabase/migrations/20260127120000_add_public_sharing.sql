
-- 1. Add is_public column to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- 2. Update RLS for projects to allow viewing public ones
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;

CREATE POLICY "Users can manage their own projects" ON public.projects
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public projects" ON public.projects
    FOR SELECT USING (is_public = true);

-- 3. Add is_public to books (Optional but good)
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

CREATE POLICY "Anyone can view public books" ON public.books
    FOR SELECT USING (is_public = true);
