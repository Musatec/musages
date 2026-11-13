# Plan de correction de l’audit

Ce plan sert de feuille de route pour corriger les problèmes repérés lors de la revue statique. L’audit n’a pas encore couvert chaque fonction, page et flux métier en profondeur : la première étape consiste donc à compléter l’inventaire avant de considérer le projet comme corrigé.

## Principes de travail

- Traiter une étape à la fois et garder chaque changement petit et vérifiable.
- Préserver les changements locaux déjà présents dans le dépôt ; ne pas les écraser sans les examiner.
- Pour chaque action serveur, vérifier l’identité, l’appartenance au Daara, le rôle autorisé, les entrées, puis seulement effectuer l’opération.
- Ne jamais renvoyer un succès si aucune modification n’a réellement été faite.
- Après chaque étape, faire une revue ciblée et exécuter les validations appropriées avant de passer à la suivante.
- Ne pas déployer ni effectuer de migration destructive dans le cadre des corrections sans autorisation explicite.

## Étape 0 — Établir l’état de référence

1. Examiner les changements déjà présents dans le dépôt et les distinguer des corrections futures.
2. Cartographier les routes, Server Actions, accès Prisma, fournisseurs externes et fonctionnalités exposées dans l’interface.
3. Classer les constats par gravité : sécurité, perte ou fuite de données, erreurs fonctionnelles, qualité et déploiement.
4. Vérifier les scripts de validation existants et noter ceux qui sont fiables ; ne pas se fier aux anciens fichiers de logs ou rapports comme preuve de l’état actuel.

**Critère de sortie :** inventaire des actions serveur et API avec leur contrôle d’authentification, leur contrôle d’appartenance au Daara, leurs validations et leur état réel (implémenté, incomplet ou simulé).

## Étape 1 — Fermer les failles d’accès et d’isolation des données

1. Examiner chaque export de `src/lib/actions/**` et chaque route dans `src/app/api/**`.
2. Ajouter un contrôle d’authentification côté serveur à toute opération privée ; le middleware ne remplace pas ces contrôles.
3. Ajouter des contrôles de rôle aux opérations réservées aux administrateurs ou responsables.
4. Pour chaque lecture et écriture multi-tenant, inclure le `daaraId` issu de la session dans la requête de base de données. Ne pas faire confiance à un `daaraId`, rôle ou identifiant de propriétaire reçu du client.
5. Corriger en priorité les cas identifiés : suppression d’enseignant, mises à jour et suppressions de transactions, actions de notifications, actions RH et opérations sur classes/sujets.
6. Vérifier aussi les mutations utilisant `findUnique` ou `update({ where: { id } })` après une vérification séparée : préférer une mutation conditionnée par le tenant quand le modèle le permet.
7. Vérifier que les fonctions appelables par le client, dont `createNotification`, ne permettent pas d’écrire au nom d’un autre utilisateur.

**Critère de sortie :** aucune action privée ne dépend uniquement de l’interface ou du proxy pour l’autorisation ; les lectures et mutations sont bornées au Daara et au rôle appropriés.

## Étape 2 — Sécuriser les entrées et les erreurs

1. Remplacer les paramètres `any` et les données non validées par des schémas Zod partagés et typés.
2. Valider les identifiants, montants positifs et finis, dates, enums, chaînes, tailles de texte, pagination et filtres.
3. Rejeter les champs non autorisés afin d’éviter les modifications indirectes de rôle, plan ou tenant.
4. Ne pas renvoyer les messages internes Prisma ou les détails d’exception aux clients ; journaliser côté serveur sans données sensibles.
5. Uniformiser les résultats d’action : succès uniquement après écriture effective, erreurs explicites et sûres, et cas « introuvable/non autorisé » cohérents.
6. Ajouter limitation de débit aux points sensibles : connexion, création de compte, réinitialisation et endpoints publics.

**Critère de sortie :** chaque entrée non fiable a une validation explicite et aucun chemin d’erreur ne divulgue de détails internes.

## Étape 3 — Fiabiliser l’authentification et les comptes

1. Réexaminer `allowDangerousEmailAccountLinking` pour Google ; choisir une liaison vérifiée qui ne repose pas uniquement sur une adresse e-mail supposée identique.
2. Vérifier le flux complet d’inscription Google : création atomique du Daara et de l’utilisateur, unicité e-mail et gestion des connexions simultanées.
3. Vérifier que les utilisateurs supprimés/logiquement désactivés ne peuvent pas s’authentifier via Google ou mot de passe.
4. Définir et appliquer une politique de mot de passe cohérente avec l’inscription et la connexion ; vérifier le flux de réinitialisation.
5. Confirmer que les rôles, `daaraId` et statut de compte dans le JWT proviennent de la base et ne peuvent pas être modifiés via une mise à jour de session côté client.
6. Vérifier les redirections publiques/localisées et les URLs de rappel OAuth sur les environnements de déploiement.

**Critère de sortie :** parcours e-mail/mot de passe et Google vérifiés, sans élévation de rôle ni prise de contrôle par liaison de compte non vérifiée.

## Étape 4 — Remplacer les fonctions simulées par des fonctionnalités réelles

1. Confirmer avec l’usage attendu du produit les modules qui doivent être livrés : inventaire, boutiques, ventes, fournisseurs/achats, dettes, notes de frais, classes/matières, notes et rapports, RH et capital.
2. Pour chaque module, documenter le modèle de données, les règles métier, les rôles et les liens avec le Daara.
3. Implémenter les opérations de lecture/écriture et les validations serveur avant de brancher les écrans.
4. Remplacer les retours vides ou faux succès par des résultats réels, ou rendre clairement la fonctionnalité indisponible tant qu’elle n’est pas implémentée.
5. Vérifier les montants et rapports avec des cas métier concrets, notamment recettes, dépenses, suppressions et périodes.

**Critère de sortie :** chaque bouton visible produit l’effet attendu et durable, ou l’interface indique sans ambiguïté que la fonction n’est pas disponible.

## Étape 5 — Vérifier le schéma, les migrations et la persistance

1. Clarifier l’environnement cible : SQLite sur volume persistant, ou base distante ; vérifier que l’adaptateur Prisma et les variables configurées correspondent à cette cible.
2. Documenter les migrations et confirmer qu’elles couvrent le schéma utilisé en production.
3. Vérifier les contraintes d’intégrité, suppressions en cascade, unicité par Daara, index des requêtes fréquentes et gestion des suppressions logiques.
4. Vérifier que les fichiers SQLite, sauvegardes, journaux contenant des données et fichiers temporaires ne sont pas suivis par Git.
5. Documenter et vérifier la sauvegarde/restauration avant toute migration de production.

**Critère de sortie :** déploiement avec stockage durable, migrations reproductibles et procédure de restauration connue.

## Étape 6 — Durcir la configuration de production

1. Revoir la CSP : retirer `unsafe-eval` si possible, réduire les scripts inline et définir les domaines nécessaires à partir des intégrations réellement utilisées.
2. Vérifier les en-têtes de sécurité, HTTPS, cookies de session, domaines, CORS/CSRF et règles de cache.
3. Vérifier que seules les variables publiques nécessaires utilisent le préfixe `NEXT_PUBLIC_` et qu’aucune clé privée n’est intégrée au bundle client.
4. Vérifier les configurations Sentry, PostHog, Crisp et Supabase en production, y compris la minimisation des données personnelles dans les événements.
5. Vérifier que les pages et données authentifiées ne sont pas mises en cache publiquement ou par le service worker PWA.
6. Vérifier les journaux : ne jamais écrire de mots de passe, tokens, secrets, données médicales ou contenus privés.

**Critère de sortie :** les réglages de déploiement sont explicites, les secrets restent côté serveur et la politique de cache respecte la confidentialité.

## Étape 7 — Vérification finale et préparation au déploiement

1. Ajouter ou compléter des tests ciblés pour l’isolation multi-tenant, les rôles, les validations et les notifications.
2. Vérifier les parcours essentiels : inscription/connexion, création du Daara, élèves, présence et frais.
3. Lancer les vérifications configurées du projet (types, lint, tests, build) et corriger les erreurs introduites par les changements.
4. Faire une revue finale des différences, des migrations et des fichiers suivis ; confirmer que les changements locaux préexistants sont préservés.
5. Déployer d’abord dans un environnement de préproduction, contrôler les journaux et les parcours, puis préparer la mise en production.

**Critère de sortie :** validations réussies, risques résiduels documentés, sauvegarde vérifiée et procédure de retour arrière disponible.

## Ordre de correction recommandé

1. Étape 0 — état de référence et inventaire.
2. Étapes 1 à 3 — accès, validation et authentification.
3. Étape 4 — fonctionnalités simulées, selon les priorités produit.
4. Étapes 5 et 6 — base de données et configuration de production.
5. Étape 7 — vérification complète et préparation au déploiement.

Les étapes 1 à 3 sont prioritaires, car elles concernent les données des utilisateurs. Les fonctions simulées peuvent ensuite être traitées module par module selon l’usage attendu.

## Progression de l’exécution

### Périmètre métier confirmé

- L’application sert à la gestion d’une école et d’un Daara par la direction.
- Aucun paiement en ligne, panier de paiement, fournisseur de paiement ni abonnement payant ne fait partie du produit. Les pages et intégrations PayTech ont été retirées.
- Le registre de scolarité reste nécessaire : le bureau consigne manuellement les règlements reçus physiquement, notamment en espèces ou par chèque. Cette fonction est une écriture comptable interne, pas un paiement effectué dans l’application.

### État des étapes

- **Étape 0 — en cours :** les fichiers modifiés localement ont été relevés. Le premier inventaire recense 83 exports d’actions serveur et une route API (Auth.js) ; les routes de paiement en ligne, de seed et de setup déjà présentes dans le dépôt local ont été retirées. Les contrats de chaque action et les intégrations restantes doivent encore être documentés et classés.
- **Étape 1 — en cours :** contrôles d’identité, de rôle et de Daara renforcés sur plusieurs actions et pages ; accès aux notifications limité à leur propriétaire ; champs sensibles retirés des listes et retours de comptes utilisateurs ; les rôles et le Daara du jeton sont rechargés depuis la base et les profils Google sans e-mail vérifié sont refusés. Les mutations financières et scolaires ont reçu plusieurs contrôles tenant, et la revue exhaustive des exports et pages reste à faire.
- **Étape 2 — commencée :** validation de montants et champs ajoutée aux saisies de frais, transactions, règlements physiques, élèves, classes, présence, progression Hifz, Khatm, oustazs et RH. Plusieurs retours simulés ont été remplacés par une indisponibilité explicite, et les montants du rapport financier sont maintenant agrégés sur tout l’historique plutôt que sur 100 lignes. Les autres actions et formulaires restent à examiner.
- **Étape 4 — en cours :** le registre Sadaqa et les parrainages utilisent maintenant les modèles Prisma déjà présents, avec contrôle du Daara et du rôle. Les dons financiers reçus sont inscrits à la fois dans le registre des dons et dans les recettes comptables ; les promesses mensuelles de parrainage ne sont pas comptabilisées comme de l’argent reçu. Les modules de facturation, boutiques, ventes, dettes, fournisseurs, achats et inventaire n’ont pas de modèles dédiés dans le schéma actuel : leurs lectures ne renvoient plus de zéros ou listes vides trompeurs, et les écrans factures/boutiques indiquent leur indisponibilité. Le registre RH/paie est aussi signalé comme non configuré, tandis que les enseignants restent gérables dans le module Oustazs. Le rapport financier utilise les transactions réellement saisies pour le mois courant, avec une courbe journalière des recettes réelles. Les règles et le schéma des modules métier éventuels restent à définir.
- **Étapes 3, 5, 6 et 7 — à traiter :** revue complète de l’authentification, schéma et persistance, configuration de production, puis validations finales.

Cette progression ne signifie pas que le projet est prêt à être déployé. Chaque étape doit atteindre son critère de sortie avant de passer à la vérification finale.
