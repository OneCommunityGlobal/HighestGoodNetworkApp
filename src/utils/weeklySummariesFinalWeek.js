/**
 * Final-week rules for the Weekly Summaries Report.
 *
 * The backend sets finalWeekIndex on each summary: the tab of the week a
 * user left (0 = This Week, 1 = Last Week, 2 = Week Before Last,
 * 3 = Three Weeks Ago) for users who are no longer active, and null for
 * everyone else. The frontend uses that value as-is so both sides agree.
 */

/** True when this tab is the week an inactive user left. */
export const isFinalWeekOnTab = (summary, weekIndex) =>
  summary?.isActive === false &&
  Number.isInteger(summary.finalWeekIndex) &&
  summary.finalWeekIndex === weekIndex;

/**
 * Active users always show. Inactive users show only on the tab of the
 * week they left. An active user's endDate (a scheduled separation) is
 * ignored, so scheduling a final day never hides someone early.
 */
export const shouldShowSummaryOnTab = (summary, weekIndex) =>
  summary?.isActive !== false || isFinalWeekOnTab(summary, weekIndex);
