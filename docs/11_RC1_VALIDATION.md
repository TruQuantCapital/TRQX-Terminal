# TRQX Engine v1.0 RC1 Validation

## Purpose

This checkpoint verifies the simulator before the project shifts to the Operations Command Center.

## Automated Validation

Run:

```powershell
.\scripts\testing\Verify-TRQXEngine.ps1
```

The script checks:

- Required simulator files
- Five registered scenarios
- Documentation baseline
- Zero-byte production files
- Legacy storage references
- Git branch and working tree
- Production build

## Manual Browser Validation

Test each pattern in confirmed and failed mode:

- Hammer
- Shooting Star
- Bullish Engulfing
- Bearish Engulfing
- Doji

For each test:

1. Start replay.
2. Reveal candles.
3. Record at least one decision.
4. Complete the trade ticket.
5. Submit the trade.
6. Review the trade grade.
7. Review certification.
8. Open the journal.
9. Confirm the journal entry.
10. Confirm no storage error appears.

## RC1 Exit Criteria

- Automated validation passes.
- Manual validation passes for all ten scenario variants.
- Production build passes.
- Storage remains healthy.
- Documentation is current.
- Release checklist is complete.
