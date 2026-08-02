# TRQX Repository Maintenance Toolkit

## Create and verify the scaffold

Run from the repository root:

```powershell
.\scripts\maintenance\Normalize-Repository.ps1
```

## Scan only

```powershell
.\scripts\maintenance\Normalize-Repository.ps1 `
  -SkipBuild `
  -SkipValidator
```

## Apply safe fixes

```powershell
.\scripts\maintenance\Normalize-Repository.ps1 `
  -ApplySafeFixes
```

Safe fixes may:

- Remove empty malformed source directories.
- Quarantine non-empty malformed source directories.
- Archive one-time root scripts.
- Create missing Operations provider directories.

The tool does not overwrite application source files.