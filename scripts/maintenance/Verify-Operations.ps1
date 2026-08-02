param(
    [switch]$ApplySafeFixes
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$OperationsRoot = Join-Path $ProjectRoot "src\features\operations"

$RequiredDirectories = @(
    "dashboard",
    "content",
    "publishing",
    "analytics",
    "settings",
    "providers",
    "providers\discord",
    "providers\facebook",
    "providers\instagram",
    "providers\x",
    "providers\youtube",
    "providers\email"
)

if (-not (Test-Path -LiteralPath $OperationsRoot -PathType Container)) {
    throw ("Operations root not found: " + $OperationsRoot)
}

$Missing = @()

foreach ($RelativePath in $RequiredDirectories) {
    $Path = Join-Path $OperationsRoot $RelativePath

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        $Missing += $RelativePath

        if ($ApplySafeFixes) {
            New-Item -ItemType Directory -Force -Path $Path | Out-Null
            Write-Host ("CREATED: " + $RelativePath) -ForegroundColor Green
        }
        else {
            Write-Host ("MISSING: " + $RelativePath) -ForegroundColor Yellow
        }
    }
    else {
        Write-Host ("READY: " + $RelativePath) -ForegroundColor Green
    }
}

if ($Missing.Count -eq 0) {
    Write-Host "PASS: Operations folder structure is complete." -ForegroundColor Green
}
elseif (-not $ApplySafeFixes) {
    Write-Host ("REVIEW: " + $Missing.Count + " Operations directories are missing.") -ForegroundColor Yellow
}

exit 0