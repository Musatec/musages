-- Vérification et correction des permissions pour la table personal_resources
-- Assure RLS est activé
ALTER TABLE personal_resources ENABLE ROW LEVEL SECURITY;

-- Suppression des anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow all for owner" ON personal_resources;
DROP POLICY IF EXISTS "Users manage own personal resources" ON personal_resources;

-- Création de la politique de sécurité correcte
CREATE POLICY "Allow all for owner" ON personal_resources 
FOR ALL USING (auth.uid() = user_id);

-- Vérification que la politique est bien créée
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'personal_resources';
