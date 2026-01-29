-- SCRIPT DE TEST DE CONNEXION À SUPABASE
-- Exécutez ce script directement dans l'éditeur SQL Supabase

-- 1. Vérifier que nous sommes connectés
SELECT 
    'Connection Test' as test_type,
    current_user as connected_user,
    current_database() as current_db,
    version() as postgres_version;

-- 2. Vérifier les tables existantes
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('projects', 'personal_resources', 'tasks', 'project_resources')
ORDER BY table_name;

-- 3. Vérifier les colonnes de personal_resources
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'personal_resources' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Vérifier les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('projects', 'personal_resources', 'tasks', 'project_resources')
ORDER BY tablename, policyname;

-- 5. Compter les enregistrements
SELECT 
    'projects' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT user_id) as unique_users
FROM projects
UNION ALL
SELECT 
    'personal_resources' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT user_id) as unique_users
FROM personal_resources
UNION ALL
SELECT 
    'tasks' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT user_id) as unique_users
FROM tasks
UNION ALL
SELECT 
    'project_resources' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT created_by) as unique_users
FROM project_resources
ORDER BY table_name;

-- 6. Test d'insertion simple
-- (Commenté pour éviter d'altérer les données)
-- INSERT INTO personal_resources (user_id, title, type, category) 
-- VALUES ('test-user-id', 'Test Connection', 'PROMPT', 'Test')
-- SELECT id, title, created_at FROM personal_resources WHERE title = 'Test Connection';
