# SCRIPT D'INSTALLATION ET CONFIGURATION SUPABASE CLI
# Exécutez ce script dans PowerShell en tant qu'administrateur

Write-Host "🚀 Installation et Configuration de Supabase CLI pour Musages" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Yellow

# ÉTAPE 1: Installation de Supabase CLI
Write-Host "`n📦 ÉTAPE 1: Installation de Supabase CLI..." -ForegroundColor Green

# Méthode 1: PowerShell Gallery
try {
    Write-Host "Installation via PowerShell Gallery..." -ForegroundColor Blue
    Install-Module -Name Supabase -Scope CurrentUser -Force
    Write-Host "✅ Supabase CLI installé via PowerShell Gallery" -ForegroundColor Green
} catch {
    Write-Host "❌ Échec de l'installation via PowerShell Gallery" -ForegroundColor Red
    
    # Méthode 2: Téléchargement direct
    Write-Host "Tentative d'installation directe..." -ForegroundColor Blue
    $url = "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe"
    $output = "$env:USERPROFILE\supabase.exe"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $output
        # Ajouter au PATH
        $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
        if ($currentPath -notlike "*$env:USERPROFILE*") {
            [Environment]::SetEnvironmentVariable("PATH", $currentPath + ";$env:USERPROFILE", "User")
        }
        Write-Host "✅ Supabase CLI installé directement" -ForegroundColor Green
    } catch {
        Write-Host "❌ Échec de l'installation directe" -ForegroundColor Red
        Write-Host "Veuillez installer manuellement depuis: https://github.com/supabase/cli/releases" -ForegroundColor Yellow
        exit 1
    }
}

# ÉTAPE 2: Vérification de l'installation
Write-Host "`n🔍 ÉTAPE 2: Vérification de l'installation..." -ForegroundColor Green

try {
    $version = supabase --version
    Write-Host "✅ Supabase CLI version: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI non trouvé dans le PATH" -ForegroundColor Red
    Write-Host "Redémarrez votre terminal et réessayez" -ForegroundColor Yellow
    exit 1
}

# ÉTAPE 3: Connexion à Supabase
Write-Host "`n🔑 ÉTAPE 3: Connexion à Supabase..." -ForegroundColor Green

Write-Host "1. Allez sur https://supabase.com/dashboard/account/tokens" -ForegroundColor Blue
Write-Host "2. Générez un nouveau token" -ForegroundColor Blue
Write-Host "3. Copiez le token" -ForegroundColor Blue
Write-Host "4. Collez-le ci-dessous" -ForegroundColor Blue

$token = Read-Host "Entrez votre token Supabase"

try {
    $result = supabase login --token $token
    Write-Host "✅ Connexion réussie à Supabase" -ForegroundColor Green
} catch {
    Write-Host "❌ Échec de la connexion" -ForegroundColor Red
    Write-Host "Vérifiez votre token et réessayez" -ForegroundColor Yellow
    exit 1
}

# ÉTAPE 4: Lien du projet
Write-Host "`n🔗 ÉTAPE 4: Lien du projet..." -ForegroundColor Green

$projectRef = Read-Host "Entrez votre Project Reference (ex: abcdefghijklmnopqrstuvwxyz)"

try {
    $result = supabase link --project-ref $projectRef
    Write-Host "✅ Projet lié avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Échec du lien du projet" -ForegroundColor Red
    Write-Host "Vérifiez votre Project Reference" -ForegroundColor Yellow
    exit 1
}

# ÉTAPE 5: Configuration finale
Write-Host "`n⚙️  ÉTAPE 5: Configuration finale..." -ForegroundColor Green

# Mettre à jour package.json avec le bon project ref
$packageJsonPath = "package.json"
$packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
$packageJson.scripts."supabase:link" = "supabase link --project-ref $projectRef"
$packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath

Write-Host "✅ Package.json mis à jour" -ForegroundColor Green

# ÉTAPE 6: Test final
Write-Host "`n🧪 ÉTAPE 6: Test final..." -ForegroundColor Green

try {
    $status = supabase status
    Write-Host "✅ Configuration terminée avec succès!" -ForegroundColor Green
    Write-Host "`n🎉 Vous pouvez maintenant utiliser:" -ForegroundColor Cyan
    Write-Host "  npm run db:push          - Pousser les migrations" -ForegroundColor White
    Write-Host "  npm run db:diff          - Voir les différences" -ForegroundColor White
    Write-Host "  npm run supabase:status  - Vérifier le statut" -ForegroundColor White
    Write-Host "  npm run migration:new    - Créer une migration" -ForegroundColor White
} catch {
    Write-Host "❌ Erreur lors du test final" -ForegroundColor Red
    Write-Host "Vérifiez votre configuration" -ForegroundColor Yellow
}

Write-Host "`n🚀 Installation et configuration terminées!" -ForegroundColor Green
Write-Host "Redémarrez votre terminal pour appliquer les changements PATH" -ForegroundColor Yellow
