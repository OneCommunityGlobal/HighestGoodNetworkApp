export const PROJECT_STATUS_GOOD_COLOR = '#328D1B';
export const PROJECT_STATUS_BAD_COLOR = '#C82F2F';
export const PROJECT_STATUS_NEUTRAL_COLOR = '#000';

// Project Status metrics where a decrease is the good outcome
// (fewer delayed projects, less material wasted, shorter durations).
export const LOWER_IS_BETTER_METRICS = new Set([
  'delayedProjects',
  'materialWasted',
  'avgProjectDuration',
]);

/**
 * Week-over-week change color for a Project Status card.
 * Increases are good by default; for lower-is-better metrics a decrease is good.
 */
export function getProjectStatusChangeColor(metric, lowerIsBetter = false) {
  if (typeof metric?.percentageChange !== 'number') {
    return PROJECT_STATUS_BAD_COLOR;
  }
  if (metric.percentageChange === 0) {
    return PROJECT_STATUS_NEUTRAL_COLOR;
  }
  const isIncrease = metric.percentageChange > 0;
  return isIncrease === lowerIsBetter ? PROJECT_STATUS_BAD_COLOR : PROJECT_STATUS_GOOD_COLOR;
}
