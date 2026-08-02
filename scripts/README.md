# TRQX Maintenance Toolkit

## RC1 Validation

Run from the repository root:

```powershell
.\scripts\testing\Verify-TRQXEngine.ps1
```

Skip the production build:

```powershell
.\scripts\testing\Verify-TRQXEngine.ps1 -SkipBuild
```

Require a clean Git working tree:

```powershell
.\scripts\testing\Verify-TRQXEngine.ps1 -FailOnGitChanges
```

Reports are written to:

`reports/`

## Storage Health

```powershell
.\scripts\maintenance\Storage-Health.ps1
```

This performs repository checks and prints the browser validation steps.
