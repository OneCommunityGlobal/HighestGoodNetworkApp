# Supplier performance Phase 2

Implemented: historical trends, monthly/quarterly/yearly aggregation, deterministic risk, two-supplier comparisons, all/top-five/bottom-five ranking, persisted administrator/owner root-cause editing, read-only tags, CSV/PDF exports, loading/empty/error states and responsive theme styles. Optional AI integration is deferred; no dependencies were added.

## Files
Frontend (paths relative to HighestGoodNetworkApp):
- src/actions/summaryDashboard.js
- src/components/BMDashboard/WeeklyProjectSummary/WeeklyProjectSummary.jsx
- src/components/BMDashboard/WeeklyProjectSummary/__tests__/WeeklyProjectSummary.test.jsx
- src/components/BMDashboard/WeeklyProjectSummary/SupplierPerformanceGraph.jsx
- src/components/BMDashboard/WeeklyProjectSummary/SupplierPerformanceGraph.module.css
- src/components/BMDashboard/WeeklyProjectSummary/SupplierAnalyticsPanel.jsx
- src/components/BMDashboard/WeeklyProjectSummary/SupplierAnalyticsPanel.test.jsx
- src/components/BMDashboard/WeeklyProjectSummary/supplierAnalytics.js
- src/components/BMDashboard/WeeklyProjectSummary/supplierAnalytics.test.js
- SUPPLIER_ANALYTICS_PHASE2.md

Backend (paths relative to HGNRest):
- src/controllers/summaryDashboard/supplierPerformance.js
- src/controllers/summaryDashboard/__tests__/supplierAnalytics.test.js
- src/models/summaryDashboard/supplierPerformance.js
- src/models/summaryDashboard/supplierRootCause.js
- src/routes/summaryDashboard/supplierPerformanceRouter.js

## API and storage
GET /api/suppliers/analytics?projectId=all&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD returns {records, causes}. It selects observations by end date, inclusive through the final UTC day. It validates dates and project IDs. The legacy aggregate endpoint retains its overlap semantics for compatibility; historical analytics explicitly use end-date semantics.

PUT /api/suppliers/root-causes accepts {supplierKey, tags}. Authentication middleware sets req.user from the verified token. Only Administrator and Owner roles may write. Body-provided roles do not grant access. Tags are trimmed/deduplicated, limited to ten tags of 80 characters, and replace the stored set; [] clears it. Supplier existence is checked before upsert. GET history supplies read-only tags to other authenticated users.

SupplierPerformance now accepts optional supplierId and slaTarget (0-100). Performance input accepts zero and validates percentages, dates, project IDs and SLA targets. SupplierRootCause is a new collection with a unique supplierKey and timestamps. Tags apply across projects. Existing records need no migration; explicitly backfill supplierId from an authoritative source to resolve name collisions. No inferred identity backfill is performed. When migrating an identity, migrate its tags as well.

## Methodology
Records have percentages but no delivery counts. Rankings use the unweighted mean of observed percentages within the selected date/project range, with supplier key as deterministic tie breaker. Top/bottom filters show up to five suppliers. All analytics, chart series and export rows use the same filtered supplier set; comparison selects from that set.

Historical observations are assigned to the UTC month, quarter or year containing their endDate, with no invented splitting of intervals. Each period is the arithmetic mean of its actual observations. Empty periods remain null chart gaps. Trend compares the first and last observed period; absolute changes below 2 percentage points are stable. Two observed periods are required.

Risk needs at least three observed reporting periods. Let SD be population standard deviation of period means, C mean absolute change between successive observed period means, F percentage of source observations below target, and D mean nonnegative shortfall in percentage points. Score = 0.25*min(100,2*SD) + 0.25*C + 0.30*F + 0.20*D, capped at 100 and rounded to two decimals. Low <30, Medium <60, High >=60. Targets use the recorded SLA or the user-visible reporting benchmark (initially 90%). Missing-SLA record counts and selected benchmark are included in exports. This benchmark is a reporting assumption, not a historical contractual SLA. Changing aggregation changes consistency measurements and may leave too little history for risk.

## Data limitations
No delivery counts, per-shipment events, historical SLA backfill or authoritative supplier identity mapping are available. Percentages cannot be volume-weighted. Legacy suppliers match exact names, potentially combining identically named vendors. Long reporting intervals cannot support finer-grained historical claims. No missing observations are fabricated. Root causes are manual annotations and do not establish causality.

## Manual verification
1. Open /bmdashboard/totalconstructionsummary, Reports > Financials. Verify the original bar chart and historical panel.
2. Select project/date presets. Change Monthly/Quarterly/Yearly and benchmark; verify observed bucket means and insufficient-history messages.
3. Select all/top/bottom (including a project with fewer than five suppliers). Select distinct suppliers A/B and verify aligned gaps and legends.
4. As Administrator/Owner, edit tags on a supplier with below-target observations, reload, replace tags, then clear all. As a volunteer confirm read-only display; a direct PUT must return 403 even with a forged body role.
5. Export both CSV and PDF with ranking and comparison active. Verify selected supplier IDs, range, project, benchmark, bucket counts, percentages, trend/risk and tags. Check multi-page PDF headers and quoted CSV tags.
6. Toggle dark/light themes and inspect desktop/tablet/mobile layouts, horizontal table scrolling, keyboard labels/focus and error states with failed network requests.

Live authenticated browser and database verification were not performed in this workspace.

## Automated validation results
- Frontend: `npx vitest run src/components/BMDashboard/WeeklyProjectSummary/supplierAnalytics.test.js src/components/BMDashboard/WeeklyProjectSummary/SupplierAnalyticsPanel.test.jsx` passed, 10 tests. Covers aggregation, risk/benchmark, rankings above/below five vendors, decline, comparison alignment and calendar gaps, CSV escaping/report rows, PDF table payload, admin tag UI and read-only/error states. PDF serialization itself is mocked in the UI test.
- Backend: `npm test -- --runTestsByPath src/controllers/summaryDashboard/__tests__/supplierPerformance.test.js src/controllers/summaryDashboard/__tests__/supplierAnalytics.test.js` passed, 23 tests. Includes existing behavior, zero performance/SLA identity input, invalid dates, inclusive final day, forged-role rejection, and tag replacement/removal. Persistence calls use model mocks, not a live MongoDB instance.
- ESLint on changed JavaScript/JSX: frontend passed; backend passed with warnings (complexity, function length, numeric constants, null comparisons and test-loop style), zero errors.
- Frontend production `npm run build`: passed (9235 modules), with mixed static/dynamic imports and large-chunk warnings.
- Backend `npx babel src -d dist`: passed, 796 files. This invokes the compiler directly because the package build script contains POSIX file-copy commands.
- `git diff --check`: passed in both repositories; Git reports existing line-ending conversion notices.
- Full repository test suites were not run. Live browser/theme/mobile and live database acceptance checks remain manual as described above.

## Dashboard placement correction
The existing supplier chart was mounted under Tools and Equipment Tracking. It is now mounted once under Financials, after Cost Breakdown, in a full-width container. Expand Financials to view it. If Financials is hidden by saved preferences, open Customize Cards, choose Finance Focus (or All Cards), then expand Financials. A dashboard regression test verifies this placement and prevents duplicate supplier charts in Tools and Equipment Tracking.
