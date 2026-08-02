$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$StorageFiles = @(
    "src\trqxEngine\storage\storageService.js",
    "src\trqxEngine\storage\compactSession.js",
    "src\trqxEngine\storage\migrateLegacyStorage.js",
    "src\trqxEngine\session\sessionStore.js",
    "src\trqxEngine\trade\journal\journalStore.js"
)

Write-Host ""
Write-Host "TRQX STORAGE HEALTH" -ForegroundColor Cyan
Write-Host ""

foreach ($RelativePath in $StorageFiles) {
    $Path = Join-Path $ProjectRoot $RelativePath
    $Exists = Test-Path -LiteralPath $Path -PathType Leaf
    $Length = if ($Exists) { (Get-Item -LiteralPath $Path).Length } else { 0 }

    if ($Exists -and $Length -gt 0) {
        Write-Host ("PASS: " + $RelativePath + " - " + $Length + " bytes") -ForegroundColor Green
    }
    else {
        Write-Host ("FAIL: " + $RelativePath) -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Browser check:" -ForegroundColor Yellow
Write-Host "1. Open /engine-test."
Write-Host "2. Complete and submit a trade."
Write-Host "3. Open browser DevTools."
Write-Host "4. Check Application > Local Storage."
Write-Host "5. Confirm trqx_engine_v2 exists."
Write-Host "6. Confirm trqx_training_sessions_v1 is removed."
Write-Host ""
