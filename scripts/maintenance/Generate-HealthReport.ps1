param()

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$ReportsRoot = Join-Path $ProjectRoot "reports"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ReportPath = Join-Path $ReportsRoot ("Repository-Health-" + $Timestamp + ".txt")

New-Item -ItemType Directory -Force -Path $ReportsRoot | Out-Null

$Lines = @()
$Lines += "TRQX REPOSITORY HEALTH"
$Lines += "Generated: " + (Get-Date)
$Lines += ""
$Lines += "BRANCH"
$Lines += (& git -C $ProjectRoot branch --show-current 2>&1 | Out-String).Trim()
$Lines += ""
$Lines += "GIT STATUS"
$Lines += @(& git -C $ProjectRoot status --short 2>&1)
$Lines += ""
$Lines += "MALFORMED SOURCE DIRECTORIES"

$Malformed = @(
    Get-ChildItem -LiteralPath (Join-Path $ProjectRoot "src") -Recurse -Directory |
    Where-Object {
        $_.Name -match '\.(js|jsx|ts|tsx|css)$'
    }
)

if ($Malformed.Count -eq 0) {
    $Lines += "None"
}
else {
    foreach ($Directory in $Malformed) {
        $Lines += $Directory.FullName.Substring($ProjectRoot.Length + 1)
    }
}

$Lines += ""
$Lines += "ZERO-BYTE SOURCE FILES"

$ZeroByteFiles = @(
    Get-ChildItem -LiteralPath (Join-Path $ProjectRoot "src") -Recurse -File |
    Where-Object {
        $_.Length -eq 0 -and
        $_.Extension -in @(".js", ".jsx", ".ts", ".tsx", ".css")
    }
)

if ($ZeroByteFiles.Count -eq 0) {
    $Lines += "None"
}
else {
    foreach ($File in $ZeroByteFiles) {
        $Lines += $File.FullName.Substring($ProjectRoot.Length + 1)
    }
}

$Lines | Set-Content -LiteralPath $ReportPath -Encoding utf8

Write-Host ("REPORT: " + $ReportPath) -ForegroundColor Cyan
exit 0