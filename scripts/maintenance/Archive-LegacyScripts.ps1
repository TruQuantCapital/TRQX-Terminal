param(
    [switch]$ApplySafeFixes
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$ArchiveRoot = Join-Path $ProjectRoot "scripts\archive"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$DestinationRoot = Join-Path $ArchiveRoot $Timestamp

$Patterns = @(
    "Create-Sprint*.ps1",
    "Create-TRQX*.ps1",
    "Repair-*.ps1",
    "Clean-*.ps1"
)

$Files = @()

foreach ($Pattern in $Patterns) {
    $Files += @(
        Get-ChildItem -LiteralPath $ProjectRoot -File -Filter $Pattern -ErrorAction SilentlyContinue
    )
}

$Files = @(
    $Files |
    Sort-Object FullName -Unique
)

if ($Files.Count -eq 0) {
    Write-Host "PASS: No legacy root scripts found." -ForegroundColor Green
    exit 0
}

Write-Host ("FOUND: " + $Files.Count + " legacy root scripts.") -ForegroundColor Yellow

if (-not $ApplySafeFixes) {
    foreach ($File in $Files) {
        Write-Host ("REVIEW: " + $File.Name)
    }

    exit 0
}

New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null

foreach ($File in $Files) {
    Move-Item -LiteralPath $File.FullName -Destination $DestinationRoot
    Write-Host ("ARCHIVED: " + $File.Name) -ForegroundColor Green
}

exit 0