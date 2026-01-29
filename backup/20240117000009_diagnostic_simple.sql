-- SCRIPT DE DIAGNOSTIC SIMPLE POUR PERSONAL_RESOURCES
-- Exécutez ce script pour verifier l'etat de la table

-- 1. Verifier si la table existe
SELECT 
    'Table Check' as info,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'personal_resources'
        ) THEN 'OK: Table personal_resources existe'
        ELSE 'ERREUR: Table personal_resources n existe pas'
    END as status;

-- 2. Verifier la structure de la table
SELECT 
    'Table Structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'personal_resources' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verifier les politiques RLS
SELECT 
    'RLS Policies' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'personal_resources'
ORDER BY policyname;

-- 4. Compter les enregistrements
SELECT 
    'Data Count' as info,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users
FROM personal_resources;

-- 5. Verifier les derniers enregistrements
SELECT 
    'Recent Data' as info,
    id,
    user_id,
    title,
    type,
    created_at
FROM personal_resources 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Instructions de reparation si necessaire
SELECT 
    'Instructions' as info,
    CASE 
        WHEN NOT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'personal_resources'
        ) THEN 'ERREUR: Executez d abord: 20240117000001_create_personal_resources.sql'
        WHEN NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'personal_resources'
        ) THEN 'ERREUR: Activez RLS et creez les politiques'
        ELSE 'OK: Table semble correctement configuree'
    END as status;
