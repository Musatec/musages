-- Migration de test pour vérifier le fonctionnement
-- Ajout d'une colonne de test à la table personal_resources

ALTER TABLE personal_resources 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- Ajout d'un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_personal_resources_is_favorite 
ON personal_resources(is_favorite);

-- Commentaire pour documentation
COMMENT ON COLUMN personal_resources.is_favorite IS 'Indique si la ressource est marquée comme favorite';