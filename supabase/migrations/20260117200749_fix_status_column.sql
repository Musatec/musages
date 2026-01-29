-- Correction de la colonne status dans la table projects
-- Ajout de la valeur par défaut correcte

ALTER TABLE public.projects 
ALTER COLUMN status SET DEFAULT 'IDEA';

-- Vérification que la colonne status existe bien
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name = 'status';