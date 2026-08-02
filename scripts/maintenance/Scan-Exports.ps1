param()

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$SourceRoot = Join-Path $ProjectRoot "src"
$Problems = @()

$Files = @(
    Get-ChildItem -LiteralPath $SourceRoot -Recurse -File |
    Where-Object {
        $_.Extension -in @(".js", ".jsx", ".ts", ".tsx")
    }
)

foreach ($File in $Files) {
    $Text = [IO.File]::ReadAllText($File.FullName)
    $Names = @()

    $NamedDeclarations = [regex]::Matches(
        $Text,
        '(?m)^\s*export\s+(?:async\s+)?(?:function|class|const|let|var)\s+(?<name>[A-Za-z_$][\w$]*)'
    )

    foreach ($Match in $NamedDeclarations) {
        $Names += $Match.Groups["name"].Value
    }

    $ExportBlocks = [regex]::Matches(
        $Text,
        '(?s)export\s*\{(?<body>.*?)\}'
    )

    foreach ($Block in $ExportBlocks) {
        $Parts = $Block.Groups["body"].Value -split ","

        foreach ($Part in $Parts) {
            $Clean = ($Part -replace '\s+', ' ').Trim()

            if ($Clean -match '\bas\s+(?<name>[A-Za-z_$][\w$]*)$') {
                $Names += $Matches["name"]
            }
            elseif ($Clean -match '^(?<name>[A-Za-z_$][\w$]*)$') {
                $Names += $Matches["name"]
            }
        }
    }

    $Duplicates = @(
        $Names |
        Group-Object |
        Where-Object {
            $_.Count -gt 1
        }
    )

    foreach ($Duplicate in $Duplicates) {
        $Problems += [PSCustomObject]@{
            File = $File.FullName.Substring($ProjectRoot.Length + 1)
            Name = $Duplicate.Name
            Count = $Duplicate.Count
        }
    }
}

if ($Problems.Count -eq 0) {
    Write-Host "PASS: No obvious duplicate exports found." -ForegroundColor Green
    exit 0
}

Write-Host ("FAIL: " + $Problems.Count + " duplicate export candidates found.") -ForegroundColor Red

foreach ($Problem in $Problems) {
    Write-Host (
        $Problem.File +
        " -> " +
        $Problem.Name +
        " (" +
        $Problem.Count +
        ")"
    )
}

exit 1