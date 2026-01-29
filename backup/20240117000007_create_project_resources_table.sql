-- CRÉATION DE LA TABLE DE LIAISON PROJETS-RESSOURCES
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Création de la table de liaison
CREATE TABLE IF NOT EXISTS public.project_resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.personal_resources(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Activation de RLS (Row Level Security)
ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;

-- 3. Politique de sécurité : utilisateurs ne voient que leurs propres liaisons
DROP POLICY IF EXISTS "Users manage own project resources" ON public.project_resources;
CREATE POLICY "Users manage own project resources" 
ON public.project_resources 
FOR ALL 
USING (
  auth.uid() = created_by
) 
WITH CHECK (
  auth.uid() = created_by
);

-- 4. Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS project_resources_project_id_idx ON public.project_resources(project_id);
CREATE INDEX IF NOT EXISTS project_resources_resource_id_idx ON public.project_resources(resource_id);
CREATE INDEX IF NOT EXISTS project_resources_created_by_idx ON public.project_resources(created_by);

-- 5. Donner les permissions nécessaires
GRANT ALL ON public.project_resources TO authenticated;
GRANT SELECT ON public.project_resources TO anon;

-- 6. Vérification finale
SELECT 
    'Table project_resources créée avec succès' as status,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'project_resources' 
AND table_schema = 'public'
ORDER BY ordinal_position;
