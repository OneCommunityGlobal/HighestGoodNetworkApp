import {
  isQualifiedForBio,
  BIO_MIN_TANGIBLE_HOURS,
  BIO_MIN_DAYS_IN_TEAM,
} from '../bioQualification';

const qualified = {
  totalTangibleHrs: 100,
  daysInTeam: 70,
  bioPosted: 'default',
};

describe('isQualifiedForBio()', () => {
  it('qualifies a user over both thresholds whose bio is not posted', () => {
    expect(isQualifiedForBio(qualified)).toBe(true);
  });

  it('still qualifies once the bio has been requested', () => {
    expect(isQualifiedForBio({ ...qualified, bioPosted: 'requested' })).toBe(true);
  });

  it('disqualifies once the bio is posted, ending the workflow', () => {
    expect(isQualifiedForBio({ ...qualified, bioPosted: 'posted' })).toBe(false);
  });

  it('requires strictly more than the hour threshold', () => {
    expect(isQualifiedForBio({ ...qualified, totalTangibleHrs: BIO_MIN_TANGIBLE_HOURS })).toBe(
      false,
    );
    expect(isQualifiedForBio({ ...qualified, totalTangibleHrs: BIO_MIN_TANGIBLE_HOURS + 1 })).toBe(
      true,
    );
  });

  it('requires strictly more than the tenure threshold', () => {
    expect(isQualifiedForBio({ ...qualified, daysInTeam: BIO_MIN_DAYS_IN_TEAM })).toBe(false);
    expect(isQualifiedForBio({ ...qualified, daysInTeam: BIO_MIN_DAYS_IN_TEAM + 1 })).toBe(true);
  });

  // Tenure, not weekly summary output: 24e1c6ba2 swapped these and changed who qualifies.
  it('ignores weeklySummariesCount entirely', () => {
    expect(isQualifiedForBio({ ...qualified, daysInTeam: 10, weeklySummariesCount: 99 })).toBe(
      false,
    );
    expect(isQualifiedForBio({ ...qualified, weeklySummariesCount: 0 })).toBe(true);
  });

  it('does not qualify when the row is missing or the fields are absent', () => {
    expect(isQualifiedForBio(null)).toBe(false);
    expect(isQualifiedForBio(undefined)).toBe(false);
    expect(isQualifiedForBio({})).toBe(false);
    expect(isQualifiedForBio({ ...qualified, daysInTeam: undefined })).toBe(false);
  });
});
