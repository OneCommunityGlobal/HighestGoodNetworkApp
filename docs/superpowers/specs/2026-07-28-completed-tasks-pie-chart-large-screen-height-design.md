# CompletedTasksPieChart — Large-Screen Height Sizing

**Date:** 2026-07-28
**Branch:** `handika/people-report-solution-for-large-tasks`

## Problem

In [CompletedTasksPieChart.jsx](../src/components/Reports/PeopleReport/CompletedTasksPieChart.jsx) the legend table is capped with a fixed `60vh` / `80vh` CSS rule. The desired behavior is:

- **Screens `>= 2000px`:** cap the table by the leftover space inside the parent `.stats` block (the metrics row + the existing `PeopleTasksPieChart` consume only part of it). Show as many rows as fit, clip the rest, and show a `+N more rows` footer.
- **Screens `< 2000px`:** show all rows, no clipping, no `+N more rows` footer. The user always sees the full legend.

## Approach

[PeopleReport.jsx](../src/components/Reports/PeopleReport/PeopleReport.jsx) decides, based on viewport width, whether to pass a measured height to `<CompletedTasksPieChart />`:

- On screens `>= 2000px`: measure three DOM nodes — `.stats`, `.metrics`, and the wrapper around `<PeopleTasksPieChart />` — compute `availableHeight = stats - metrics - pieChart`, and pass it as a `maxHeight` prop. The chart applies that height inline on `.legend-scroll-area`.
- On screens `< 2000px`: pass `null`. The chart omits the inline `maxHeight` so `.legend-scroll-area` has no height cap and renders all rows.

## Available height formula

```
availableHeight = statsRef.current.clientHeight
                 - metricsRef.current.clientHeight
                 - pieChartRef.current.clientHeight
```

Clamped to `>= 0` so the layout never breaks on very small viewports.

## Files changed

### 1. `src/components/Reports/PeopleReport/PeopleReport.jsx`

- Add `useRef` to the existing React import (already imports `useCallback`, `useEffect`, `useState`).
- Add three refs inside the component body:
  - `const statsRef = useRef(null);` on `<div className={styles.stats}>`.
  - `const metricsRef = useRef(null);` on `<div className={styles.metrics}>`.
  - `const pieChartRef = useRef(null);` on a new wrapper `<div ref={pieChartRef} className={styles.peopleTasksPieChartWrapper}>` placed directly around `<PeopleTasksPieChart darkMode={darkMode} />`.
- Add `const [availableHeight, setAvailableHeight] = useState(null);`.
- Add a `useEffect` that:
  - Reads `window.innerWidth` once on mount and stores it as `isWide` (`>= 2000`).
  - If `!isWide`: calls `setAvailableHeight(null)` and returns early — no observer, no resize listener needed.
  - If `isWide`: returns early if any of the three refs is unset.
  - Defines `compute = () => { const available = Math.max(0, statsRef.current.clientHeight - metricsRef.current.clientHeight - pieChartRef.current.clientHeight); setAvailableHeight(available); }`.
  - Calls `compute()` once on mount.
  - Creates a `ResizeObserver` that calls `compute()` on every observation.
  - Observes all three refs.
  - Adds a `window.resize` listener that checks `window.innerWidth >= 2000`. When the boundary is crossed (either direction), it calls `setAvailableHeight(null)` so the parent re-renders and this effect re-runs with the new `isWide` value.
  - Returns a cleanup that disconnects the observer and removes the listener.
- Dep array: `[statsRef, metricsRef, pieChartRef]`. The boundary check is handled by clearing `availableHeight` on the resize listener, which forces the effect to re-run because the state setter triggers a re-render.
- Update the `<CompletedTasksPieChart />` call to pass the new prop:
  `<CompletedTasksPieChart darkMode={darkMode} maxHeight={availableHeight} />`.

### 2. `src/components/Reports/PeopleReport/CompletedTasksPieChart.jsx`

- Add `maxHeight` to the function signature: `function CompletedTasksPieChart({ darkMode, maxHeight })`.
- On the `<div className={styles['legend-scroll-area']}>` add an inline `style` prop that, when `typeof maxHeight === 'number'`, sets `style={{ maxHeight: `${maxHeight}px` }}`; otherwise no `style` prop (no height cap — all rows render).
- No changes to the existing row-counting `useEffect` or the `+N more rows` footer — they already measure against the tbody's real bottom and work for any container height. When there is no cap, every row's `bottom <= tbodyRect.bottom` so `hiddenCount` stays `0` and the footer never renders.

### 3. `src/components/Reports/PeopleReport/PeopleReport.module.css`

- Add a single new rule so the new wrapper div around `PeopleTasksPieChart` is a normal block container (no styling beyond the default — this is only so the ref has a stable, predictable measurement):
  ```css
  .peopleTasksPieChartWrapper {
    display: block;
  }
  ```
- No other changes. The existing `.reportStats` height media queries (default `698px`, `869px`, `873px`, `895px`, `721px` in the 1489–1784 range) continue to define the height of `.stats`.

### 4. `src/components/Reports/PeopleReport/CompletedTasksPieChart.module.css`

- **Remove the `60vh` cap on `.legend-scroll-area` and the `80vh` override inside the `min-width: 2000px` media query.** They are no longer needed: below 2000px the chart gets `maxHeight={null}` and should grow freely, and above 2000px the chart gets `maxHeight={<number>}` as an inline style.
- Update `.legend-scroll-area` to keep only the visual clipping and layout rules:
  ```css
  .legend-scroll-area {
    position: relative;
    overflow: hidden;
  }
  ```
- The `.more-rows-footer` rule stays unchanged — it still renders when `hiddenCount > 0`, which only happens when an inline `maxHeight` cap is applied.

## Behavior matrix

| Screen width | `maxHeight` prop        | Effective cap on `.legend-scroll-area`        | Footer            |
| ------------ | ----------------------- | ----------------------------------------------- | ----------------- |
| < 2000px     | `null`                   | none — table grows to fit all rows              | never rendered    |
| >= 2000px    | number from JS          | `<available>px` (inline)                        | shows `+N more rows` when rows overflow |
| >= 2000px, mount frame | `null` (pre-measure) | none for one frame, snaps to measured value once | snaps in once measurement lands |

## Edge cases

- **Initial paint flicker on wide screens:** `clientHeight` is `0` before mount, so the table grows to fit all rows for one frame and then snaps to the measured cap. Brief flicker on first paint only.
- **Resize across the 2000px boundary:** the `useEffect` re-runs when `window.innerWidth` crosses `2000`. Going wide → narrow clears `availableHeight` to `null` and the table expands to show all rows; going narrow → wide re-installs the `ResizeObserver` and recomputes.
- **Negative available height:** clamp with `Math.max(0, ...)`. Table collapses; footer shows all rows hidden. No crash.
- **Refs null during unmount race:** effect early-returns, leaves prior `availableHeight` in state. No update on a dead component.
- **`PeopleTasksPieChart` height changes** (e.g. dark mode label reflow): the `ResizeObserver` on `pieChartRef` re-fires the compute, table re-sizes.

## Out of scope

- Removing the dummy data (`// TEMP: 80 dummy tasks`) in `CompletedTasksPieChart.jsx`.
- Any visual redesign of the rows, footer, or the chart itself.
- Adjusting the `2000px` breakpoint (chosen to match the existing `@media (min-width: 2000px)` rule in `CompletedTasksPieChart.module.css`).

## Testing notes

This change is layout-driven and not easily covered by unit tests. Verification:

1. Manual check on a viewport `< 2000px`: all rows are visible, no `+N more rows` footer.
2. Manual check on a viewport `>= 2000px`: the table fills the leftover vertical space inside `.stats` (the metrics row and the first pie chart sit above it, the Total Hours + footer below), and the `+N more rows` footer shows the count of rows that didn't fit.
3. Resize the browser from wide → narrow: table cap should be released (all rows become visible, footer disappears).
4. Resize the browser narrow → wide: table cap should re-apply and the row count should adjust.