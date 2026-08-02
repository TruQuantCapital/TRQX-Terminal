param(
    [switch]$SkipBuild,
    [switch]$FailOnGitChanges
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$ReportRoot = Join-Path $ProjectRoot "reports"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ReportPath = Join-Path $ReportRoot ("TRQX-RC1-Validation-" + $Timestamp + ".txt")

New-Item -ItemType Directory -Force -Path $ReportRoot | Out-Null

$Results = @()

function Add-Check {
    param(
        [string]$Category,
        [string]$Name,
        [bool]$Passed,
        [string]$Detail
    )

    $Result = [PSCustomObject]@{
        Category = $Category
        Name = $Name
        Passed = $Passed
        Detail = $Detail
    }

    $script:Results += $Result

    if ($Passed) {
        Write-Host ("[PASS] " + $Category + " - " + $Name + ": " + $Detail) -ForegroundColor Green
    }
    else {
        Write-Host ("[FAIL] " + $Category + " - " + $Name + ": " + $Detail) -ForegroundColor Red
    }
}

function Test-RequiredFile {
    param(
        [string]$RelativePath,
        [string]$Category
    )

    $Path = Join-Path $ProjectRoot $RelativePath
    $Exists = Test-Path -LiteralPath $Path -PathType Leaf
    $Length = 0

    if ($Exists) {
        $Length = (Get-Item -LiteralPath $Path).Length
    }

    $Passed = $Exists -and ($Length -gt 0)

    if (-not $Exists) {
        $Detail = "Missing"
    }
    elseif ($Length -le 0) {
        $Detail = "Zero bytes"
    }
    else {
        $Detail = $Length.ToString() + " bytes"
    }

    Add-Check `
        -Category $Category `
        -Name $RelativePath `
        -Passed $Passed `
        -Detail $Detail
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " TRQX ENGINE v1.0 RC1 VALIDATION" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$RequiredCoreFiles = @(
    "src\trqxEngine\index.js",
    "src\pages\TrqxEngineTestPage.jsx",
    "src\trqxEngine\engine\scenarioRegistry.js",
    "src\trqxEngine\validation\validateOHLC.js",
    "src\trqxEngine\replay\ReplayPlayer.jsx",
    "src\trqxEngine\grading\gradeDecision.js",
    "src\trqxEngine\coach\buildCoachMessage.js",
    "src\trqxEngine\diagnostics\EngineDiagnosticsPanel.jsx",
    "src\trqxEngine\diagnostics\runEngineDiagnostics.js",
    "src\trqxEngine\diagnostics\diagnostics.css",
    "src\trqxEngine\session\createSession.js",
    "src\trqxEngine\session\sessionReducer.js",
    "src\trqxEngine\session\sessionStore.js",
    "src\trqxEngine\session\useTrainingSession.js",
    "src\trqxEngine\storage\storageService.js",
    "src\trqxEngine\storage\compactSession.js",
    "src\trqxEngine\storage\migrateLegacyStorage.js",
    "src\trqxEngine\trade\builder\TradeBuilderPanel.jsx",
    "src\trqxEngine\trade\grading\gradeTradePlan.js",
    "src\trqxEngine\trade\grading\TradeGradePanel.jsx",
    "src\trqxEngine\certification\calculateCertification.js",
    "src\trqxEngine\certification\CertificationPanel.jsx",
    "src\trqxEngine\trade\journal\createJournalEntry.js",
    "src\trqxEngine\trade\journal\journalStore.js",
    "src\trqxEngine\trade\journal\JournalPanel.jsx"
)

foreach ($RelativePath in $RequiredCoreFiles) {
    Test-RequiredFile -RelativePath $RelativePath -Category "Core"
}

$ScenarioFolders = @(
    "hammer",
    "shootingStar",
    "bullishEngulfing",
    "bearishEngulfing",
    "doji"
)

foreach ($Scenario in $ScenarioFolders) {
    foreach ($Name in @("metadata.js", "generator.js", "index.js")) {
        $RelativePath = "src\trqxEngine\scenarios\candlesticks\" + $Scenario + "\" + $Name
        Test-RequiredFile -RelativePath $RelativePath -Category "Scenario"
    }
}

$Docs = @(
    "docs\00_PROJECT_STATUS.md",
    "docs\01_MASTER_ROADMAP.md",
    "docs\02_TECHNICAL_PROJECT_BOOK.md",
    "docs\03_CUSTOMER_PLAYBOOK.md",
    "docs\04_VIDEO_WALKTHROUGH_GUIDE.md",
    "docs\05_ADMINISTRATOR_GUIDE.md",
    "docs\07_OPERATIONS_CENTER_PLAN.md",
    "docs\09_RELEASE_CHECKLIST.md",
    "docs\10_TROUBLESHOOTING_GUIDE.md",
    "docs\11_RC1_VALIDATION.md"
)

foreach ($RelativePath in $Docs) {
    Test-RequiredFile -RelativePath $RelativePath -Category "Documentation"
}

$SourceRoot = Join-Path $ProjectRoot "src"

$ZeroByteFiles = @(
    Get-ChildItem -LiteralPath $SourceRoot -Recurse -File |
    Where-Object {
        $_.Length -eq 0 -and
        $_.Extension -in @(".js", ".jsx", ".ts", ".tsx", ".css")
    }
)

if ($ZeroByteFiles.Count -eq 0) {
    $ZeroByteDetail = "None"
    $ZeroBytePassed = $true
}
else {
    $ZeroByteDetail = $ZeroByteFiles.Count.ToString() + " found"
    $ZeroBytePassed = $false
}

Add-Check `
    -Category "Repository" `
    -Name "Zero-byte production source files" `
    -Passed $ZeroBytePassed `
    -Detail $ZeroByteDetail

$OldStorageMatches = @(
    Get-ChildItem -LiteralPath $SourceRoot -Recurse -File |
    Where-Object {
        $_.Extension -in @(".js", ".jsx", ".ts", ".tsx")
    } |
    Select-String -Pattern "trqx_training_sessions_v1"
)

$AllowedLegacyFile = Join-Path $ProjectRoot "src\trqxEngine\storage\migrateLegacyStorage.js"

$UnexpectedOldStorageMatches = @(
    $OldStorageMatches |
    Where-Object {
        $_.Path -ne $AllowedLegacyFile
    }
)

if ($UnexpectedOldStorageMatches.Count -eq 0) {
    $LegacyDetail = "Only migration code may reference the old key"
    $LegacyPassed = $true
}
else {
    $LegacyDetail = $UnexpectedOldStorageMatches.Count.ToString() + " unexpected references"
    $LegacyPassed = $false
}

Add-Check `
    -Category "Storage" `
    -Name "Legacy session key references" `
    -Passed $LegacyPassed `
    -Detail $LegacyDetail

$IndexPath = Join-Path $ProjectRoot "src\trqxEngine\index.js"

if (Test-Path -LiteralPath $IndexPath -PathType Leaf) {
    $IndexText = [IO.File]::ReadAllText($IndexPath)
}
else {
    $IndexText = ""
}

foreach ($Scenario in $ScenarioFolders) {
    $Registered = $IndexText.Contains($Scenario)

    if ($Registered) {
        $Detail = "Registered in src\trqxEngine\index.js"
    }
    else {
        $Detail = "Not found in src\trqxEngine\index.js"
    }

    Add-Check `
        -Category "Registry" `
        -Name $Scenario `
        -Passed $Registered `
        -Detail $Detail
}

$GitBranch = (& git branch --show-current 2>&1 | Out-String).Trim()
$BranchPassed = -not [string]::IsNullOrWhiteSpace($GitBranch)

Add-Check `
    -Category "Git" `
    -Name "Current branch" `
    -Passed $BranchPassed `
    -Detail $GitBranch

$GitStatus = @(& git status --short 2>&1)
$GitClean = $GitStatus.Count -eq 0
$GitPassed = $true

if ($FailOnGitChanges -and -not $GitClean) {
    $GitPassed = $false
}

if ($GitClean) {
    $GitDetail = "Clean"
}
else {
    $GitDetail = $GitStatus.Count.ToString() + " changed or untracked paths"
}

Add-Check `
    -Category "Git" `
    -Name "Working tree" `
    -Passed $GitPassed `
    -Detail $GitDetail

if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "Running npm run build..." -ForegroundColor Cyan

    & npm run build
    $BuildPassed = $LASTEXITCODE -eq 0

    if ($BuildPassed) {
        $BuildDetail = "npm run build completed"
    }
    else {
        $BuildDetail = "npm run build failed"
    }

    Add-Check `
        -Category "Build" `
        -Name "Production build" `
        -Passed $BuildPassed `
        -Detail $BuildDetail
}
else {
    Add-Check `
        -Category "Build" `
        -Name "Production build" `
        -Passed $true `
        -Detail "Skipped by parameter"
}

$PassedCount = @($Results | Where-Object { $_.Passed }).Count
$FailedCount = @($Results | Where-Object { -not $_.Passed }).Count
$OverallPassed = $FailedCount -eq 0

if ($OverallPassed) {
    $OverallText = "PASS"
    $FinalColor = "Green"
}
else {
    $OverallText = "FAIL"
    $FinalColor = "Yellow"
}

$Lines = @()
$Lines += "TRQX ENGINE v1.0 RC1 VALIDATION"
$Lines += "Generated: " + (Get-Date)
$Lines += "Branch: " + $GitBranch
$Lines += ""
$Lines += "SUMMARY"
$Lines += "Passed: " + $PassedCount
$Lines += "Failed: " + $FailedCount
$Lines += "Overall: " + $OverallText
$Lines += ""
$Lines += "DETAILS"

foreach ($Result in $Results) {
    if ($Result.Passed) {
        $Status = "PASS"
    }
    else {
        $Status = "FAIL"
    }

    $Lines += "[" + $Status + "] " +
        $Result.Category + " | " +
        $Result.Name + " | " +
        $Result.Detail
}

if ($ZeroByteFiles.Count -gt 0) {
    $Lines += ""
    $Lines += "ZERO-BYTE FILES"

    foreach ($File in $ZeroByteFiles) {
        $Lines += $File.FullName.Substring($ProjectRoot.Length + 1)
    }
}

if ($UnexpectedOldStorageMatches.Count -gt 0) {
    $Lines += ""
    $Lines += "UNEXPECTED LEGACY STORAGE REFERENCES"

    foreach ($Match in $UnexpectedOldStorageMatches) {
        $RelativeMatchPath = $Match.Path.Substring($ProjectRoot.Length + 1)
        $Lines += $RelativeMatchPath + ":" + $Match.LineNumber + " " + $Match.Line.Trim()
    }
}

if ($GitStatus.Count -gt 0) {
    $Lines += ""
    $Lines += "GIT STATUS"

    foreach ($Line in $GitStatus) {
        $Lines += [string]$Line
    }
}

$Lines | Set-Content -LiteralPath $ReportPath -Encoding utf8

Write-Host ""
Write-Host "==================================================" -ForegroundColor $FinalColor
Write-Host (" RC1 VALIDATION " + $OverallText) -ForegroundColor $FinalColor
Write-Host "==================================================" -ForegroundColor $FinalColor
Write-Host ("Report: " + $ReportPath) -ForegroundColor Cyan
Write-Host ""

if (-not $OverallPassed) {
    exit 1
}
