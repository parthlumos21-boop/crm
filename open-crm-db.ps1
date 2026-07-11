param(
  [string]$MongoUri = "mongodb://127.0.0.1:27017/crm",
  [string]$DatabaseName = "crm"
)

$ErrorActionPreference = "Stop"

Write-Host "CRM MongoDB URI for Compass:" -ForegroundColor Cyan
Write-Host $MongoUri
Write-Host ""
Write-Host "Database name: $DatabaseName"
Write-Host ""

$compassCommand = Get-Command "MongoDBCompass.exe" -ErrorAction SilentlyContinue

if (-not $compassCommand) {
  $programFilesX86 = [Environment]::GetFolderPath("ProgramFilesX86")
  $possibleCompassPaths = @(
    (Join-Path $env:LOCALAPPDATA "Programs\MongoDB Compass\MongoDBCompass.exe"),
    (Join-Path $env:ProgramFiles "MongoDB Compass\MongoDBCompass.exe"),
    (Join-Path $programFilesX86 "MongoDB Compass\MongoDBCompass.exe")
  )

  $compassPath = $possibleCompassPaths | Where-Object {
    $_ -and (Test-Path -LiteralPath $_)
  } | Select-Object -First 1
} else {
  $compassPath = $compassCommand.Source
}

if ($compassPath) {
  Write-Host "Opening MongoDB Compass..." -ForegroundColor Green
  Start-Process -FilePath $compassPath -ArgumentList $MongoUri
  exit 0
}

Write-Warning "MongoDB Compass was not found on this machine."
Write-Host "Open MongoDB Compass manually and paste this URI:" -ForegroundColor Yellow
Write-Host $MongoUri
