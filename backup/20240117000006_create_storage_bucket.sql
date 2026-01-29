-- CRÉATION DU BUCKET STORAGE POUR LES IMAGES
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Créer le bucket pour les images des ressources
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources-images',
  'resources-images',
  true,
  5242880, -- 5MB en octets
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. Créer les politiques de sécurité pour le bucket
-- Politique pour permettre aux utilisateurs d'uploader leurs propres images
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'resources-images' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre aux utilisateurs de voir leurs propres images
CREATE POLICY "Users can view their own images" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resources-images' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres images
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'resources-images' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres images
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'resources-images' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Donner les permissions sur le bucket
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- 4. Vérification
SELECT 
    'Bucket storage créé' as status,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'resources-images';
