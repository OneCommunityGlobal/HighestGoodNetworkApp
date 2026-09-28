/**
 * Single source of truth for "is this person qualified for a bio".
 *
 * The rule below is the one that ran unchanged from 2023-07-15 (14078de29) until
 * 2026-05-12, when 24e1c6ba2 swapped tenure (`daysInTeam`) for weekly summary output
 * (`weeklySummariesCount`). Those measure different things — someone can be six months
 * in the team with three summaries — so the tenure rule is restored here.
 *
 * `daysInTeam` is computed server-side in HGNRest (`reporthelper.weeklySummaries`) as a
 * $dateDiff in days from the user's createdDate, and survives `formatSummaries`.
 *
 * Keep every consumer on this function: the yellow highlight bar and the Bio Status
 * filter must agree, or a user shows a bar while being absent from the filter list.
 */

export const BIO_MIN_TANGIBLE_HOURS = 80;
export const BIO_MIN_DAYS_IN_TEAM = 60;

/**
 * @param {object} summary A weekly summaries report row.
 * @returns {boolean} True when the user still needs their bio posted and has earned it.
 */
export const isQualifiedForBio = summary => {
  if (!summary) return false;

  return (
    summary.totalTangibleHrs > BIO_MIN_TANGIBLE_HOURS &&
    summary.daysInTeam > BIO_MIN_DAYS_IN_TEAM &&
    summary.bioPosted !== 'posted'
  );
};

export default isQualifiedForBio;
