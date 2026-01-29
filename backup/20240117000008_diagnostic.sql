-- SCRIPT DE DIAGNOSTIC POUR PERSONAL_RESOURCES
-- Exécutez ce script pour vérifier l'état de la table

-- 1. Vérifier si la table existe
SELECT 
    'Table Check' as info,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'personal_resources'
        ) THEN '✅ Table personal_resources existe'
        ELSE '❌ Table personal_resources n\'existe pas'
    END as status;

-- 2. Vérifier la structure de la table
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

-- 3. Vérifier les politiques RLS
SELECT 
    'RLS Policies' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'personal_resources'
ORDER BY policyname;

-- 4. Vérifier les permissions
SELECT 
    'Permissions' as info,
    grantee,
    table_schema,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'personal_resources' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 5. Compter les enregistrements
SELECT 
    'Data Count' as info,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users
FROM personal_resources;

-- 6. Vérifier les derniers enregistrements
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

-- 7. Test d'insertion (commenté par défaut)
-- Décommentez pour tester l'insertion
/*
INSERT INTO personal_resources (user_id, title, type, category, content) 
VALUES (
    'test-user-id', 
    'Test Resource', 
    'PROMPT', 
    'Test', 
    'This is a test resource'
);
*/

-- 8. Instructions de réparation si nécessaire
SELECT 
    'Instructions' as info,
    CASE 
        WHEN NOT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'personal_resources'
        ) THEN '❌ Exécutez d''abord: 20240117000001_create_personal_resources.sql'
        WHEN NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'personal_resources'
        ) THEN '❌ Activez RLS et créez les politiques'
        ELSE '✅ Table semble correctement configurée'
    END as status;
