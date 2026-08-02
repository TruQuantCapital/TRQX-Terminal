param()

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$SourceRoot = Join-Path $ProjectRoot "src"

$Groups = @(
    Get-ChildItem -LiteralPath $SourceRoot -Recurse -File |
    Group-Object Name |
    Where-Object {
        $_.Count -gt 1
    } |
    Sort-Object Name
)

if ($Groups.Count -eq 0) {
    Write-Host "PASS: No duplicate filenames found." -ForegroundColor Green
    exit 0
}

Write-Host ("REVIEW: " + $Groups.Count + " duplicate filename groups found.") -ForegroundColor Yellow

foreach ($Group in $Groups) {
    Write-Host ""
    Write-Host ("FILE: " + $Group.Name) -ForegroundColor Cyan

    foreach ($File in $Group.Group) {
        Write-Host ("  " + $File.FullName.Substring($ProjectRoot.Length + 1))
    }
}

exit 0