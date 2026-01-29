# SCRIPT DE GESTION DE BASE DE DONNÉES SUPABASE
# Utilisation: .\scripts\db-manager.ps1 [action]

param(
    [Parameter(Mandatory=$true)]
    [string]$Action
)

Write-Host "🗄️  Gestionnaire de Base de Données Supabase" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Yellow

switch ($Action) {
    "status" {
        Write-Host "`n📊 Vérification du statut..." -ForegroundColor Green
        npx supabase status
    }
    
    "push" {
        Write-Host "`n📤 Poussage des migrations..." -ForegroundColor Green
        npx supabase db push
    }
    
    "diff" {
        Write-Host "`n🔍 Vérification des différences..." -ForegroundColor Green
        npx supabase db diff
    }
    
    "reset" {
        Write-Host "`n🔄 Réinitialisation de la base de données..." -ForegroundColor Yellow
        $confirm = Read-Host "Êtes-vous sûr de vouloir réinitialiser? (o/N)"
        if ($confirm -eq "o" -or $confirm -eq "O") {
            npx supabase db reset
        } else {
            Write-Host "Opération annulée" -ForegroundColor Red
        }
    }
    
    "types" {
        Write-Host "`n📝 Génération des types TypeScript..." -ForegroundColor Green
        npx supabase gen types typescript --local > src/types/supabase.ts
        Write-Host "✅ Types générés dans src/types/supabase.ts" -ForegroundColor Green
    }
    
    "migrate" {
        Write-Host "`n🆕 Création d'une nouvelle migration..." -ForegroundColor Green
        $name = Read-Host "Nom de la migration"
        npx supabase migration new $name
    }
    
    "login" {
        Write-Host "`n🔑 Connexion à Supabase..." -ForegroundColor Green
        npx supabase login
    }
    
    "link" {
        Write-Host "`n🔗 Lien du projet..." -ForegroundColor Green
        $projectRef = Read-Host "Project Reference (ex: ephsigjminwavcymicxa)"
        npx supabase link --project-ref $projectRef
    }
    
    default {
        Write-Host "`n❌ Action non reconnue: $Action" -ForegroundColor Red
        Write-Host "Actions disponibles:" -ForegroundColor Yellow
        Write-Host "  status  - Vérifier le statut" -ForegroundColor White
        Write-Host "  push    - Pousser les migrations" -ForegroundColor White
        Write-Host "  diff    - Voir les différences" -ForegroundColor White
        Write-Host "  reset   - Réinitialiser la BDD" -ForegroundColor White
        Write-Host "  types   - Générer les types" -ForegroundColor White
        Write-Host "  migrate - Créer une migration" -ForegroundColor White
        Write-Host "  login   - Se connecter" -ForegroundColor White
        Write-Host "  link    - Lier un projet" -ForegroundColor White
        Write-Host "`nUtilisation: .\scripts\db-manager.ps1 [action]" -ForegroundColor Cyan
    }
}

Write-Host "`n✅ Opération terminée!" -ForegroundColor Green
