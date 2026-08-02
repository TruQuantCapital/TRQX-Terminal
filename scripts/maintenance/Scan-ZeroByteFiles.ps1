param()

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$SourceRoot = Join-Path $ProjectRoot "src"

$Files = @(
    Get-ChildItem -LiteralPath $SourceRoot -Recurse -File |
    Where-Object {
        $_.Length -eq 0 -and
        $_.Extension -in @(".js", ".jsx", ".ts", ".tsx", ".css")
    }
)

if ($Files.Count -eq 0) {
    Write-Host "PASS: No zero-byte production source files." -ForegroundColor Green
    exit 0
}

Write-Host ("FAIL: " + $Files.Count + " zero-byte production source files found.") -ForegroundColor Red

foreach ($File in $Files) {
    Write-Host $File.FullName.Substring($ProjectRoot.Length + 1)
}

exit 1