param()

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$SourceRoot = Join-Path $ProjectRoot "src"

$ImportPattern = '(?m)^\s*import\s+(?:[\s\S]*?\s+from\s+)?["''](?<path>\.[^"'']+)["'']'
$Problems = @()

$Files = @(
    Get-ChildItem -LiteralPath $SourceRoot -Recurse -File |
    Where-Object {
        $_.Extension -in @(".js", ".jsx", ".ts", ".tsx")
    }
)

foreach ($File in $Files) {
    $Text = [IO.File]::ReadAllText($File.FullName)
    $Matches = [regex]::Matches($Text, $ImportPattern)

    foreach ($Match in $Matches) {
        $ImportPath = $Match.Groups["path"].Value
        $BaseDirectory = Split-Path -Parent $File.FullName
        $Candidate = Join-Path $BaseDirectory $ImportPath

        $Candidates = @(
            $Candidate,
            ($Candidate + ".js"),
            ($Candidate + ".jsx"),
            ($Candidate + ".ts"),
            ($Candidate + ".tsx"),
            (Join-Path $Candidate "index.js"),
            (Join-Path $Candidate "index.jsx"),
            (Join-Path $Candidate "index.ts"),
            (Join-Path $Candidate "index.tsx")
        )

        $Resolved = $false

        foreach ($Path in $Candidates) {
            if (Test-Path -LiteralPath $Path) {
                $Resolved = $true
                break
            }
        }

        if (-not $Resolved) {
            $Problems += [PSCustomObject]@{
                File = $File.FullName.Substring($ProjectRoot.Length + 1)
                Import = $ImportPath
            }
        }
    }
}

if ($Problems.Count -eq 0) {
    Write-Host "PASS: Relative imports resolved." -ForegroundColor Green
    exit 0
}

Write-Host ("FAIL: " + $Problems.Count + " unresolved relative imports found.") -ForegroundColor Red

foreach ($Problem in $Problems) {
    Write-Host ($Problem.File + " -> " + $Problem.Import)
}

exit 1