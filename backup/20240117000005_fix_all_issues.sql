-- SCRIPT COMPLET DE RÉPARATION POUR personal_resources
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Suppression de la table si elle existe (pour recréation propre)
DROP TABLE IF EXISTS public.personal_resources CASCADE;

-- 2. Recréation de la table avec toutes les colonnes nécessaires
CREATE TABLE public.personal_resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  content text,
  url text,
  type text NOT NULL CHECK (type IN ('PROMPT', 'LINK', 'IMAGE', 'IDEA')),
  category text DEFAULT 'General',
  created_at timestamptz DEFAULT now()
);

-- 3. Activation de RLS (Row Level Security)
ALTER TABLE public.personal_resources ENABLE ROW LEVEL SECURITY;

-- 4. Création de la politique de sécurité
DROP POLICY IF EXISTS "Users manage own personal resources" ON public.personal_resources;
CREATE POLICY "Users manage own personal resources" 
ON public.personal_resources 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 5. Création des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS personal_resources_user_id_idx ON public.personal_resources(user_id);
CREATE INDEX IF NOT EXISTS personal_resources_type_idx ON public.personal_resources(type);
CREATE INDEX IF NOT EXISTS personal_resources_created_at_idx ON public.personal_resources(created_at);

-- 6. Donner les permissions nécessaires
GRANT ALL ON public.personal_resources TO authenticated;
GRANT SELECT ON public.personal_resources TO anon;

-- 7. Vérification finale
SELECT 
    'Table personal_resources créée avec succès' as status,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'personal_resources' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Vérification des politiques
SELECT 
    'Politiques RLS' as type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'personal_resources';
