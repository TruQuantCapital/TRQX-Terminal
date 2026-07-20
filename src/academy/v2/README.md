# TRQX Pattern Engine v2

This package is additive. It does not replace the current Academy or `PatternSVG.jsx`.

## What is included

- Normalized 0–1 pattern coordinates
- Reusable SVG chart primitives
- Independent drop-target coordinates
- Pattern validation
- Approval status
- A rebuilt Bull Pennant benchmark
- Responsive desktop/tablet/mobile styling
- Click-to-place interaction that avoids chart overlap

## Install

Copy the `src/academy/v2` folder into the project.

Render the benchmark route or page:

```jsx
import PatternAcademyV2 from "./academy/v2/PatternAcademyV2";

export default function PatternV2Preview() {
  return <PatternAcademyV2 />;
}
```

Do not remove the current Academy yet.

## Acceptance checklist

Before a pattern receives `status: "approved"`:

1. No target overlaps another target.
2. No target covers a candle body or critical trendline.
3. No element is clipped at desktop, tablet, or mobile widths.
4. The chart visibly progresses through Setup, Context, Pattern, Confirm, and Entry.
5. The confirmation occurs after the breakout.
6. The entry is not inside the consolidation.
7. The validator returns `valid: true`.
8. The explanation includes context, confirmation, entry, and invalidation.

## Next pattern migration order

1. Bull Flag
2. Bear Flag
3. Bear Pennant
4. Ascending Triangle
5. Descending Triangle
6. Dead Cat Bounce
7. Double Top
8. Double Bottom
