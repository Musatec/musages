# 🛡️ Stratégie de Sauvegarde & Résilience - MINDOS

La protection des données est le cœur de la confiance utilisateur pour une plateforme ERP. Voici la stratégie de sauvegarde implémentée pour **MINDOS**.

## 1. Sauvegardes Automatisées (Supabase)
MINDOS utilise Supabase (Postgres), qui gère nativement la résilience des données :
- **Daily Backups** : Sauvegardes complètes quotidiennes (Plan Pro).
- **Point-in-Time Recovery (PITR)** : Permet de restaurer la base de données à n'importe quelle seconde précise des 7 derniers jours (indispensable pour les erreurs de manipulation humaine).

## 2. Sauvegardes Manuelles (Disaster Recovery)
Le script `scripts/backup-database.ps1` permet d'extraire un dump complet du schéma et des données.
- **Usage** : `powershell ./scripts/backup-database.ps1`
- **Destination** : Dossier `/backups` (ignoré par Git pour la sécurité).
- **Fréquence recommandée** : Hebdomadaire avant toute migration majeure (`npx prisma migrate`).

## 3. Intégrité Relationnelle (Isolation SaaS)
L'intégrité est maintenue par :
- **Foreign Key Constraints** : Empêche l'orphelinage de données (ex: une vente sans Store).
- **Prisma Transactions** : Toutes les opérations critiques (Ventes + Stocks) sont atomiques. Si une partie échoue, tout est annulé.

## 4. Plan de Restauration
En cas de sinistre :
1. Identifier le dernier dump stable dans `/backups` ou via le dashboard Supabase.
2. Utiliser `psql $DATABASE_URL < last_backup.sql` pour restaurer l'état.
3. Vérifier l'intégrité via le module `Laboratoire` du dashboard admin.

---
**Note Executive** : Pour le lancement public, il est **fortement recommandé** de passer au plan Supabase Pro pour activer le PITR et garantir 0 perte de données en cas d'erreur fatale.
