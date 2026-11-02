/**
 * Single source of truth for "is this person qualified for a bio".
 *
 * Business rule (confirmed by Jae, 2026-10-13): a team member qualifies for the yellow
 * bio-announcement strip once they have
 *   1. a minimum of 80 tangible hours logged, and
 *   2. a minimum of 8 Total Valid Weekly Summaries (`weeklySummariesCount`),
 * and their bio has not been posted yet.
 *
 * Tenure (`daysInTeam`) is not part of the rule: someone 60+ days in with only three
 * valid summaries must not qualify.
 *
 * Keep every consumer on this function: the yellow highlight bar and the Bio Status
 * filter must agree, or a user shows a bar while being absent from the filter list.
 */

export const BIO_MIN_TANGIBLE_HOURS = 80;
export const BIO_MIN_VALID_SUMMARIES = 8;

/**
 * @param {object} summary A weekly summaries report row.
 * @returns {boolean} True when the user still needs their bio posted and has earned it.
 */
export const isQualifiedForBio = summary => {
  if (!summary) return false;

  // weeklySummariesCount can arrive as a string from the report payload.
  const tangibleHrs = Number(summary.totalTangibleHrs);
  const validSummaries = Number(summary.weeklySummariesCount);

  return (
    tangibleHrs >= BIO_MIN_TANGIBLE_HOURS &&
    validSummaries >= BIO_MIN_VALID_SUMMARIES &&
    summary.bioPosted !== 'posted'
  );
};

export default isQualifiedForBio;
