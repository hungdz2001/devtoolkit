#!/usr/bin/env pwsh
# deploy.ps1 — Build & deploy VN Toolkit to VPS
# Usage: .\deploy.ps1

$ErrorActionPreference = "Stop"

$VPS_HOST   = "root@tools.tranchanhung.dev"
$REMOTE_DIR = "/var/www/tools.tranchanhung.dev"

Write-Host "`n[1/4] Building production..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed!" -ForegroundColor Red; exit 1 }

Write-Host "`n[2/4] Cleaning remote directory..." -ForegroundColor Cyan
ssh $VPS_HOST "rm -rf $REMOTE_DIR/*"

Write-Host "`n[3/4] Uploading files..." -ForegroundColor Cyan
scp -r dist/* "${VPS_HOST}:${REMOTE_DIR}/"

Write-Host "`n[4/4] Setting permissions & reloading nginx..." -ForegroundColor Cyan
ssh $VPS_HOST "chown -R www-data:www-data $REMOTE_DIR && chmod -R 755 $REMOTE_DIR && nginx -t && systemctl reload nginx"

Write-Host "`nDeployed successfully to https://tools.tranchanhung.dev" -ForegroundColor Green
