/**
 * Shared responsive breakpoint utilities for BMDashboard charts.
 * Uses consistent breakpoints (375, 428, 480, 768, 1024) to avoid duplication
 * between ToolsHorizontalBarChart and ToolsStoppageHorizontalBarChart.
 */

const BREAKPOINTS = [375, 428, 480, 768, 1024];

/**
 * Resolve a value for current window width from an array of values per breakpoint.
 * @param {number} windowWidth - Current window width
 * @param {number[]} values - [at375, at428, at480, at768, at1024, default]
 * @returns {number}
 */
export function getValueForBreakpoints(windowWidth, values) {
  for (let i = 0; i < BREAKPOINTS.length; i++) {
    if (windowWidth <= BREAKPOINTS[i]) return values[i];
  }
  return values[values.length - 1];
}

/** Chart height in px: 180 → 300 from small phone to desktop */
export function getChartHeight(windowWidth) {
  return getValueForBreakpoints(windowWidth, [180, 200, 220, 240, 280, 300]);
}

/** Recharts bar chart margins: { top, right, left, bottom } */
export function getChartMargins(windowWidth) {
  const tops = getValueForBreakpoints(windowWidth, [3, 4, 4, 5, 8, 10]);
  const rights = getValueForBreakpoints(windowWidth, [3, 4, 4, 5, 15, 30]);
  const lefts = getValueForBreakpoints(windowWidth, [12, 13, 14, 15, 25, 40]);
  const bottoms = getValueForBreakpoints(windowWidth, [3, 4, 4, 5, 8, 10]);
  return { top: tops, right: rights, left: lefts, bottom: bottoms };
}

/** Y-axis width for Recharts */
export function getYAxisWidth(windowWidth) {
  return getValueForBreakpoints(windowWidth, [18, 19, 19.5, 20, 28, 35]);
}

/** Font size for axis/tick labels (shared by both charts) */
export function getChartFontSize(windowWidth) {
  return getValueForBreakpoints(windowWidth, [8, 9, 9.5, 10, 11, 12]);
}

/** Chart.js maxBarThickness for ToolsStoppageHorizontalBarChart */
export function getMaxBarThickness(windowWidth) {
  return getValueForBreakpoints(windowWidth, [15, 16, 18, 20, 22, 25]);
}

/** Chart.js categoryPercentage for ToolsStoppageHorizontalBarChart */
export function getCategoryPercentage(windowWidth) {
  return getValueForBreakpoints(windowWidth, [0.45, 0.47, 0.48, 0.5, 0.55, 0.6]);
}

/** Chart.js barPercentage for ToolsStoppageHorizontalBarChart */
export function getBarPercentage(windowWidth) {
  return getValueForBreakpoints(windowWidth, [0.8, 0.82, 0.84, 0.85, 0.87, 0.9]);
}

/** Chart.js title font size for ToolsStoppageHorizontalBarChart */
export function getChartTitleFontSize(windowWidth) {
  return getValueForBreakpoints(windowWidth, [9, 10, 10.5, 11, 12, 14]);
}
