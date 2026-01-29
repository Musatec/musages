# Script pour ignorer les migrations déjà appliquées
Write-Host "🔄 Nettoyage des migrations déjà appliquées..." -ForegroundColor Green

# Lister les migrations qui causent des erreurs
$migrationsToSkip = @(
    "20240117000001_create_personal_resources.sql",
    "20240117000002_create_library_resources.sql", 
    "20240117000003_create_library_table.sql",
    "20240117000004_fix_permissions.sql",
    "20240117000005_fix_all_issues.sql",
    "20240117000006_create_storage_bucket.sql",
    "20240117000007_create_project_resources_table.sql",
    "20240117000008_diagnostic.sql",
    "20240117000009_diagnostic_simple.sql",
    "20260117192325_test_connection.sql"
)

# Créer un dossier de backup
if (-not "backup") {
    New-Item -ItemType Directory -Path "backup" -Force
}

# Déplacer les migrations problématiques vers backup
foreach ($migration in $migrationsToSkip) {
    $sourcePath = "supabase\migrations\$migration"
    $backupPath = "backup\$migration"
    
    if (Test-Path $sourcePath) {
        Write-Host "Déplacement de $migration vers backup/" -ForegroundColor Yellow
        Move-Item $sourcePath $backupPath -Force
    }
}

# Garder seulement les nouvelles migrations
Write-Host "✅ Nettoyage terminé!" -ForegroundColor Green
Write-Host "Seules les nouvelles migrations seront poussées." -ForegroundColor Cyan

# Afficher les migrations restantes
Get-ChildItem "supabase\migrations\*.sql" | 
    Where-Object { $_.Name -notin $migrationsToSkip } |
    ForEach-Object { 
        Write-Host "• $($_.Name)" -ForegroundColor White
    }
