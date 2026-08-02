param(
    [switch]$ApplySafeFixes,
    [switch]$SkipBuild,
    [switch]$SkipValidator
)

$ErrorActionPreference = "Stop"

$MaintenanceRoot = $PSScriptRoot
$ProjectRoot = (Resolve-Path (Join-Path $MaintenanceRoot "..\..")).Path
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ReportsRoot = Join-Path $ProjectRoot "reports"
$ReportPath = Join-Path $ReportsRoot ("Repository-Normalization-" + $Timestamp + ".txt")

New-Item -ItemType Directory -Force -Path $ReportsRoot | Out-Null

$Results = @()

function Run-Step {
    param(
        [string]$Name,
        [string]$ScriptName,
        [hashtable]$Arguments = @{}
    )

    $ScriptPath = Join-Path $MaintenanceRoot $ScriptName

    if (-not (Test-Path -LiteralPath $ScriptPath -PathType Leaf)) {
        throw ("Missing maintenance module: " + $ScriptPath)
    }

    Write-Host ""
    Write-Host ("==> " + $Name) -ForegroundColor Cyan

    $Output = & $ScriptPath @Arguments 2>&1
    $ExitCode = $LASTEXITCODE

    $script:Results += [PSCustomObject]@{
        Name = $Name
        ExitCode = $ExitCode
        Output = @($Output)
    }

    foreach ($Line in $Output) {
        Write-Host $Line
    }
}

Run-Step `
    -Name "Zero-byte scan" `
    -ScriptName "Scan-ZeroByteFiles.ps1"

Run-Step `
    -Name "Duplicate file scan" `
    -ScriptName "Scan-DuplicateFiles.ps1"

Run-Step `
    -Name "Import scan" `
    -ScriptName "Scan-Imports.ps1"

Run-Step `
    -Name "Export scan" `
    -ScriptName "Scan-Exports.ps1"

Run-Step `
    -Name "Folder normalization" `
    -ScriptName "Normalize-Folders.ps1" `
    -Arguments @{
        ApplySafeFixes = $ApplySafeFixes
    }

Run-Step `
    -Name "Legacy script archive" `
    -ScriptName "Archive-LegacyScripts.ps1" `
    -Arguments @{
        ApplySafeFixes = $ApplySafeFixes
    }

Run-Step `
    -Name "Operations structure verification" `
    -ScriptName "Verify-Operations.ps1" `
    -Arguments @{
        ApplySafeFixes = $ApplySafeFixes
    }

Run-Step `
    -Name "Health report generation" `
    -ScriptName "Generate-HealthReport.ps1"

if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "==> Production build" -ForegroundColor Cyan

    Push-Location $ProjectRoot

    try {
        & npm run build

        if ($LASTEXITCODE -ne 0) {
            throw "npm run build failed."
        }
    }
    finally {
        Pop-Location
    }
}

if (-not $SkipValidator) {
    $ValidatorPath = Join-Path $ProjectRoot "scripts\testing\Verify-TRQXEngine.ps1"

    if (Test-Path -LiteralPath $ValidatorPath -PathType Leaf) {
        Write-Host ""
        Write-Host "==> RC1 validator" -ForegroundColor Cyan

        & $ValidatorPath

        if ($LASTEXITCODE -ne 0) {
            throw "RC1 validation failed."
        }
    }
    else {
        Write-Host ""
        Write-Host "SKIPPED: RC1 validator not found." -ForegroundColor Yellow
    }
}

$Lines = @()
$Lines += "TRQX REPOSITORY NORMALIZATION"
$Lines += "Generated: " + (Get-Date)
$Lines += "ApplySafeFixes: " + $ApplySafeFixes
$Lines += ""

foreach ($Result in $Results) {
    $Lines += "=================================================="
    $Lines += $Result.Name
    $Lines += "Exit code: " + $Result.ExitCode
    $Lines += "=================================================="

    foreach ($Line in $Result.Output) {
        $Lines += [string]$Line
    }

    $Lines += ""
}

$Lines | Set-Content -LiteralPath $ReportPath -Encoding utf8

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host " NORMALIZATION COMPLETE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ("Report: " + $ReportPath) -ForegroundColor Cyan
Write-Host ""