# Forecast Accuracy test cases

Run the automated feature suites from the frontend directory:

```sh
npx vitest run src/components/KitchenandInventory/Reports/ForecastAccuracy.test.jsx src/components/KitchenandInventory/Reports/forecastAccuracy.test.js src/components/KitchenandInventory/Reports/__tests__/PreservationEfficiency.test.jsx
```

Automated coverage includes mock and real-data calculations, empty reports, quantity labels, accessible progress ranges and fill widths, the 95% status boundary, report navigation, live Redux theme changes, menu dismissal, period selection, CSV contents/download cleanup, and PDF contents.

## Manual responsive checks

Open `/kitchenandinventory/reports/forecast-accuracy` in browser responsive mode. Repeat these cases in light and dark mode. Enable the app's theme through the account menu on `/kitchenandinventory` before returning to Reports.

| Viewport | Expected result |
| --- | --- |
| Mobile: 320 × 568 and 390 × 844 | No horizontal page overflow. Period selector spans the controls row, export buttons share the next row, and report tabs scroll horizontally without overlapping. Names, quantities, badges, and bars fit inside the cards. |
| iPad portrait: 768 × 1024 and 820 × 1180 | Header uses the menu toggle; heading and controls fit without clipping. Cards and progress bars fill available space. |
| iPad landscape: 1024 × 768 | Open the navigation menu: every link remains reachable by scrolling when needed. Close it by overlay or link selection. Report content remains readable. |
| Desktop: 1280 × 800 and 1440 × 900 | Header navigation and report controls fit; report content is centered and does not stretch beyond the configured maximum width. |

## Interaction and accessibility checks

1. Scroll the tab strip to Forecast Accuracy on a narrow screen. Select Preservation Efficiency, then Forecast Accuracy. Content and active indicators must change together.
2. Use Tab and Shift+Tab through navigation, selector, and export controls. Focus must remain visible; the closed mobile menu must not receive focus.
3. Confirm 96% and 100% indicators are green; 88%, 85%, and 93% indicators are amber. Text and badge borders must remain readable in both themes.
4. Download CSV and PDF. Open both files and confirm all five ingredients, quantities, and displayed percentages match the page. The PDF includes the 92.4% summary.
5. Change the period and confirm the sample-data notice updates while the illustrative records remain unchanged.
6. Increase browser zoom to 200%. Verify content reflows, controls remain usable, and only the tab strip scrolls horizontally.

These visual checks require a browser; jsdom does not calculate responsive layout or verify contrast.
