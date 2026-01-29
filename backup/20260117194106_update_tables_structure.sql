-- MISE À JOUR DE LA STRUCTURE DES TABLES
-- Migration pour mettre à jour les tables selon les spécifications

-- 1. MISE À JOUR TABLE PROJECTS
-- Ajout des colonnes manquantes si besoin
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Ajout de la colonne description si elle n'existe pas
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Ajout de la colonne deadline si elle n'existe pas
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;

-- Correction du status par défaut
ALTER TABLE public.projects 
ALTER COLUMN SET DEFAULT 'IDEA';

-- 2. MISE À JOUR TABLE PERSONAL_RESOURCES
-- Ajout de la colonne is_favorite si elle n'existe pas
ALTER TABLE public.personal_resources 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- Ajout de l'index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_personal_resources_is_favorite 
ON public.personal_resources(is_favorite);

-- Ajout de l'index pour user_id
CREATE INDEX IF NOT EXISTS idx_personal_resources_user_id 
ON public.personal_resources(user_id);

-- Ajout de l'index pour type
CREATE INDEX IF NOT EXISTS idx_personal_resources_type 
ON public.personal_resources(type);

-- 3. CRÉATION TABLE TASKS SI ELLE N'EXISTE PAS
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'TODO', -- 'TODO' or 'DONE'
  priority TEXT DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CRÉATION TABLE PROJECT_RESOURCES SI ELLE N'EXISTE PAS
CREATE TABLE IF NOT EXISTS public.project_resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_id uuid REFERENCES public.personal_resources(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 5. INDEX POUR OPTIMISATION
-- Index pour les tâches
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Index pour les ressources de projet
CREATE INDEX IF NOT EXISTS idx_project_resources_project_id ON public.project_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_project_resources_resource_id ON public.project_resources(resource_id);

-- 6. COMMENTAIRES POUR DOCUMENTATION
COMMENT ON TABLE public.projects IS 'Table des projets utilisateur';
COMMENT ON TABLE public.personal_resources IS 'Bibliothèque personnelle de ressources';
COMMENT ON TABLE public.tasks IS 'Table des tâches avec échéances';
COMMENT ON TABLE public.project_resources IS 'Table de liaison entre projets et ressources';

COMMENT ON COLUMN public.projects.status IS 'Statut du projet: IDEA, ACTIVE, COMPLETED, ON_HOLD';
COMMENT ON COLUMN public.projects.deadline IS 'Date limite du projet';
COMMENT ON COLUMN public.personal_resources.is_favorite IS 'Indique si la ressource est marquée comme favorite';
COMMENT ON COLUMN public.tasks.status IS 'Statut de la tâche: TODO ou DONE';
COMMENT ON COLUMN public.tasks.priority IS 'Priorité de la tâche: LOW, MEDIUM, HIGH';
COMMENT ON COLUMN public.tasks.due_date IS 'Date d''échéance de la tâche';

-- 7. SÉCURITÉ (RLS)
-- Activation de RLS sur les nouvelles tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;

-- Politiques pour les tâches
CREATE POLICY IF NOT EXISTS "Users can manage their own tasks" 
ON public.tasks FOR ALL 
USING (auth.uid() = user_id);

-- Politiques pour les ressources de projet
CREATE POLICY IF NOT EXISTS "Users can manage their own project resources" 
ON public.project_resources FOR ALL 
USING (auth.uid() = created_by);

-- 8. PERMISSIONS
-- Donner les permissions nécessaires
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.project_resources TO authenticated;
GRANT SELECT ON public.tasks TO anon;
GRANT SELECT ON public.project_resources TO anon;