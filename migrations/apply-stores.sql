-- SQL Migration pour activer le Mode Multi-Magasins
-- À coller et exécuter directement dans le SQL Editor de Supabase

-- 1. Ajouter la colonne ownerId à la table Store
ALTER TABLE "Store" ADD COLUMN "ownerId" TEXT;

-- 2. Créer l'index et la clé étrangère pour la relation vers User
ALTER TABLE "Store" ADD CONSTRAINT "Store_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Mettre à jour le Store existant (le premier) pour l'assigner au DG existant s'il n'a pas déjà de propriétaire
UPDATE "Store" SET "ownerId" = (SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1) WHERE "ownerId" IS NULL;
