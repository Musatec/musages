# 🛡️ Stratégie de Sauvegarde & Résilience - Daara Ibnoul Khayim Al Diawziya

La protection et la pérennité des données pédagogiques, financières et administratives sont indispensables pour la confiance des Serignes Daara, Oustazs, Ndeyi Daara et parents d'élèves. Voici la stratégie de sauvegarde et de haute disponibilité implémentée pour le **Daara Ibnoul Khayim Al Diawziya**.

---

## 1. Architecture des Données & Sauvegardes

### A. Déploiement Monolithique / Local (SQLite Persistant)
L'application utilise nativement l'adaptateur haute performance `@prisma/adapter-better-sqlite3` :
- **Fichier de base de données :** `prisma/dev.db` (par défaut) ou chemin défini par la variable d'environnement `SQLITE_DB_PATH`.
- **Persistance en production :** Sur VPS ou conteneur Docker, monter un volume persistant sur le répertoire contenant le fichier SQLite (ex: `/var/data/daradji.db`).
- **Sauvegarde à chaud :** Copie atomique ou snapshot régulier du fichier `.db` vers un stockage distant chiffré.

### B. Déploiement Cloud Multi-Instances (Supabase Postgres)
Pour un hébergement distribué sans disque persistant (ex: Vercel / AWS ECS) :
- Le schéma Prisma et les migrations `supabase/migrations` sont prêts pour PostgreSQL.
- **Sauvegardes quotidiennes (Daily Backups) :** Snapshots automatiques réguliers du cluster PostgreSQL.
- **Point-in-Time Recovery (PITR) :** Restauration granulaire à la seconde près.

---

## 2. Sauvegardes Manuelles & Disaster Recovery
Un script d'extraction d'urgence est disponible :
- **Exécution :** `powershell ./scripts/backup-database.ps1`
- **Destination :** Dossier local sécurisé `/backups` (exclu d'office du suivi Git par `.gitignore`).
- **Périodicité recommandée :** Hebdomadaire et impérativement avant chaque migration de schéma (`npx prisma migrate` ou `npx supabase db push`).

---

## 3. Intégrité Relationnelle & Isolation Multi-Tenant
La résilience logique de la base est assurée par :
- **Clés Étrangères (Foreign Keys) :** Empêche tout orphelinage de données (ex: progression Hifz ou présences sans Talibé, transactions sans Daara).
- **Indexations multi-critères :** Index optimisés sur `[daaraId, talibeId]`, `[daaraId, date]`, `[userId, createdAt]` pour garantir des temps de réponse ultra-rapides.
- **Transactions Atomiques Prisma :** Toutes les opérations multi-tables (ex: Inscription d'un Talibé + affectation Halqa, ou Don Sadaqa + Transaction comptable) sont exécutées dans un bloc transactionnel atomique (`prisma.$transaction`). Si une étape échoue, aucun enregistrement corrompu n'est conservé.

---

## 4. Procédure de Restauration en Cas d'Incident
En cas de sinistre :
1. Sélectionner le snapshot le plus récent sur le dashboard Supabase ou le fichier SQL dans `/backups`.
2. Restaurer la base :
   ```bash
   psql "$DATABASE_URL" < backups/backup_YYYYMMDD.sql
   ```
3. Valider l'intégrité des modèles :
   ```bash
   npx prisma validate
   ```
4. Exécuter la suite de tests unitaires pour confirmer la validité des flux métier :
   ```bash
   npx vitest run
   ```

---
> [!TIP]
> **Recommandation Production :** Pour le passage en production publique, l'activation du plan Supabase Pro avec rétention PITR 7 jours garantit un RPO (Recovery Point Objective) et un RTO (Recovery Time Objective) optimaux.
