param(
    [switch]$ApplySafeFixes
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$SourceRoot = Join-Path $ProjectRoot "src"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$QuarantineRoot = Join-Path $ProjectRoot ("repository-quarantine\" + $Timestamp)

$MalformedDirectories = @(
    Get-ChildItem -LiteralPath $SourceRoot -Recurse -Directory |
    Where-Object {
        $_.Name -match '\.(js|jsx|ts|tsx|css)$'
    }
)

if ($MalformedDirectories.Count -eq 0) {
    Write-Host "PASS: No malformed source directories found." -ForegroundColor Green
    exit 0
}

Write-Host ("FOUND: " + $MalformedDirectories.Count + " malformed source directories.") -ForegroundColor Yellow

foreach ($Directory in $MalformedDirectories) {
    $Children = @(
        Get-ChildItem -LiteralPath $Directory.FullName -Force
    )

    $Relative = $Directory.FullName.Substring($ProjectRoot.Length + 1)

    if ($ApplySafeFixes -and $Children.Count -eq 0) {
        Remove-Item -LiteralPath $Directory.FullName -Force
        Write-Host ("REMOVED EMPTY: " + $Relative) -ForegroundColor Green
    }
    elseif ($ApplySafeFixes) {
        $Destination = Join-Path $QuarantineRoot $Relative
        $DestinationParent = Split-Path -Parent $Destination

        New-Item -ItemType Directory -Force -Path $DestinationParent | Out-Null
        Move-Item -LiteralPath $Directory.FullName -Destination $Destination

        Write-Host ("QUARANTINED: " + $Relative) -ForegroundColor Yellow
    }
    else {
        Write-Host ("REVIEW: " + $Relative + " | Children: " + $Children.Count) -ForegroundColor Yellow
    }
}

exit 0