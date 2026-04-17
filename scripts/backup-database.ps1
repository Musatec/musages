# Script de Backup Automatisé pour MINDOS (Supabase / Postgres)

# Chargement du .env
if (Test-Path ".env") {
    Get-Content .env | Where-Object { $_ -match '=' } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim([char]34))
    }
}

$DB_URL = $env:DATABASE_URL
$DATE = Get-Date -Format "yyyy-MM-dd_HH-mm"
$BACKUP_DIR = "backups"
$BACKUP_FILE = "$BACKUP_DIR/mindos_db_$DATE.sql"

# Créer le dossier backups s'il n'existe pas
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR
}

Write-Host " Dmarrage du backup de la base de donnes..." -ForegroundColor Cyan

# Note: pg_dump doit tre install sur votre machine
try {
    # Utilisation de docker si pg_dump n'est pas install localement
    # Sinon, vous pouvez remplacer par la commande pg_dump directe
    Write-Host "> Nettoyage et Exportation..."
    
    # On utilise la chane de connexion directement
    # Attention: pg_dump demande souvent le mot de passe via PGPASSWORD ou .pgpass
    $PASSWORD = ($DB_URL -split ':' | Select-Object -Index 2 | Select-Object -First 1 -ExpandProperty Split('@')[0])
    $env:PGPASSWORD = $PASSWORD
    
    # Extraire les infos de connexion
    # postgresql://user:pass@host:port/dbname
    $HOST = ($DB_URL -split '@')[1].Split(':')[0]
    $USER = ($DB_URL -split '//')[1].Split(':')[0]
    
    # Excution du dump (schma + donnes)
    # On utilise pg_dump si disponible
    if (Get-Command pg_dump -ErrorAction SilentlyContinue) {
        pg_dump $env:DATABASE_URL -f $BACKUP_FILE
        Write-Host "✅ Backup termin avec succs : $BACKUP_FILE" -ForegroundColor Green
    } else {
        Write-Host "⚠️ pg_dump n'est pas install sur cette machine." -ForegroundColor Yellow
        Write-Host "💡 Recommandation Public SaaS : Activez les backups automatiss dans le dashboard Supabase (PITR)." -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Erreur lors du backup : $($_.Exception.Message)" -ForegroundColor Red
} finally {
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
}
