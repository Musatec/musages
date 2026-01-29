# 🚀 Guide Supabase CLI pour Musages

## 📋 Installation et Configuration

### 🎯 Objectif
Gérer votre base de données Supabase directement depuis le terminal Windsurf sans ouvrir le navigateur.

### 🔧 Installation

#### Option 1: Script Automatique (Recommandé)
```powershell
# Exécutez ce script PowerShell en tant qu'administrateur
.\setup-supabase-cli.ps1
```

#### Option 2: Manuel
1. **Téléchargez Supabase CLI**:
   ```powershell
   # Via PowerShell Gallery
   Install-Module -Name Supabase -Scope CurrentUser -Force
   
   # Ou téléchargement direct
   Invoke-WebRequest -Uri "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe" -OutFile "$env:USERPROFILE\supabase.exe"
   ```

2. **Ajoutez au PATH** (si nécessaire):
   ```powershell
   $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
   [Environment]::SetEnvironmentVariable("PATH", $currentPath + ";$env:USERPROFILE", "User")
   ```

3. **Redémarrez votre terminal**

### 🔑 Connexion à Supabase

1. **Générez un token**:
   - Allez sur https://supabase.com/dashboard/account/tokens
   - Cliquez sur "Generate new token"
   - Copiez le token

2. **Connectez-vous**:
   ```bash
   supabase login --token votre-token-ici
   ```

3. **Liez votre projet**:
   ```bash
   # Trouvez votre Project Reference dans le dashboard Supabase
   supabase link --project-ref votre-project-ref
   ```

## 🎮 Commandes Disponibles

### 📊 Gestion de la Base de Données

```bash
# Pousser les migrations locales vers Supabase
npm run db:push

# Voir les différences entre local et distant
npm run db:diff

# Réinitialiser la base de données
npm run db:reset

# Vérifier le statut de la connexion
npm run supabase:status
```

### 🔄 Gestion des Migrations

```bash
# Créer une nouvelle migration
npm run migration:new nom_de_la_migration

# Pousser les migrations
npm run migration:push

# Générer les types TypeScript
npm run supabase:generate-types
```

### 🚀 Développement Local

```bash
# Démarrer Supabase localement
npm run supabase:start

# Arrêter Supabase localement
npm run supabase:stop
```

## 📝 Workflow Recommandé

### 1. Créer une nouvelle table
```bash
# Créer une nouvelle migration
npm run migration:new create_project_resources

# Éditer le fichier de migration généré
# supabase/migrations/xxxx_create_project_resources.sql
```

### 2. Appliquer les changements
```bash
# Pousser vers Supabase
npm run db:push

# Vérifier les différences
npm run db:diff
```

### 3. Générer les types
```bash
# Mettre à jour les types TypeScript
npm run supabase:generate-types
```

## 🗂️ Structure des Fichiers

```
musages/
├── supabase/
│   ├── config.toml              # Configuration Supabase
│   └── migrations/              # Fichiers de migration
│       ├── 20240117000001_create_personal_resources.sql
│       ├── 20240117000007_create_project_resources_table.sql
│       └── ...
├── src/types/
│   └── supabase.ts            # Types générés automatiquement
└── package.json                # Scripts npm
```

## 🛠️ Exemples Pratiques

### Ajouter une nouvelle colonne
```sql
-- Créer une migration
npm run migration:new add_description_to_projects

-- Éditer le fichier généré
ALTER TABLE projects ADD COLUMN description TEXT;

-- Pousser les changements
npm run db:push
```

### Créer une nouvelle table
```sql
-- Créer une migration
npm run migration:new create_categories

-- Éditer le fichier généré
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pousser les changements
npm run db:push
```

## 🐛 Dépannage

### Problèmes Communs

1. **Commande non trouvée**:
   ```bash
   # Vérifiez l'installation
   supabase --version
   
   # Redémarrez votre terminal
   ```

2. **Erreur de connexion**:
   ```bash
   # Vérifiez votre token
   supabase login --token nouveau-token
   
   # Revérifiez le lien du projet
   supabase link --project-ref votre-ref
   ```

3. **Erreur de permissions**:
   ```bash
   # Exécutez PowerShell en tant qu'administrateur
   # Ou utilisez le script d'installation automatique
   ```

### Logs et Debug

```bash
# Voir les logs détaillés
supabase db push --debug

# Vérifier la configuration
supabase status
```

## 🎯 Prochaines Étapes

1. **Exécutez le script d'installation**:
   ```powershell
   .\setup-supabase-cli.ps1
   ```

2. **Testez la connexion**:
   ```bash
   npm run supabase:status
   ```

3. **Poussez vos migrations existantes**:
   ```bash
   npm run db:push
   ```

4. **Générez les types**:
   ```bash
   npm run supabase:generate-types
   ```

## 📚 Ressources

- [Documentation Supabase CLI](https://supabase.com/docs/reference/cli)
- [Guide des migrations](https://supabase.com/docs/guides/database/migrations)
- [Types TypeScript](https://supabase.com/docs/reference/javascript/typescript-support)

---

🚀 **Vous êtes maintenant prêt à gérer votre base de données directement depuis le terminal !**
