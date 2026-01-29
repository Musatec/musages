-- ==========================================
-- CONFIGURATION GLOBALE DU STORAGE SUPABASE
-- ==========================================

-- 1. Création des Buckets (Publics)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('covers', 'covers', true),
  ('images', 'images', true),
  ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politiques RLS Universelles pour ces Buckets
-- Note: On utilise des noms uniques pour éviter les conflits avec des politiques existantes

-- INSERT
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow auth upload covers 20260126') THEN
        CREATE POLICY "Allow auth upload covers 20260126" ON storage.objects FOR INSERT TO authenticated 
        WITH CHECK (bucket_id IN ('covers', 'images', 'project-images') AND (storage.foldername(name))[1] = auth.uid()::text);
    END IF;
END $$;

-- SELECT
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select covers 20260126') THEN
        CREATE POLICY "Allow public select covers 20260126" ON storage.objects FOR SELECT TO public 
        USING (bucket_id IN ('covers', 'images', 'project-images'));
    END IF;
END $$;

-- UPDATE
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow owner update covers 20260126') THEN
        CREATE POLICY "Allow owner update covers 20260126" ON storage.objects FOR UPDATE TO authenticated 
        USING (bucket_id IN ('covers', 'images', 'project-images') AND (storage.foldername(name))[1] = auth.uid()::text);
    END IF;
END $$;

-- DELETE
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow owner delete covers 20260126') THEN
        CREATE POLICY "Allow owner delete covers 20260126" ON storage.objects FOR DELETE TO authenticated 
        USING (bucket_id IN ('covers', 'images', 'project-images') AND (storage.foldername(name))[1] = auth.uid()::text);
    END IF;
END $$;
