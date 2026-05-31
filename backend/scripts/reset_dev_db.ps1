param(
    [string]$DatabasePath = "kodeye.db"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$dbPath = Join-Path $root $DatabasePath
$backupDir = Join-Path $root "db_backups"

Set-Location $root
New-Item -ItemType Directory -Force $backupDir | Out-Null

if (Test-Path $dbPath) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupPath = Join-Path $backupDir "kodeye.$timestamp.db"
    Move-Item -LiteralPath $dbPath -Destination $backupPath
    Write-Host "Moved existing local database to $backupPath"
}

& .\venv\Scripts\alembic.exe upgrade head
Write-Host "Local development database is ready."
