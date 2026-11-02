import {
  isQualifiedForBio,
  BIO_MIN_TANGIBLE_HOURS,
  BIO_MIN_VALID_SUMMARIES,
} from '../bioQualification';

const qualified = {
  totalTangibleHrs: 100,
  weeklySummariesCount: 10,
  bioPosted: 'default',
};

describe('isQualifiedForBio()', () => {
  it('qualifies a user meeting both thresholds whose bio is not posted', () => {
    expect(isQualifiedForBio(qualified)).toBe(true);
  });

  it('still qualifies once the bio has been requested', () => {
    expect(isQualifiedForBio({ ...qualified, bioPosted: 'requested' })).toBe(true);
  });

  it('disqualifies once the bio is posted, ending the workflow', () => {
    expect(isQualifiedForBio({ ...qualified, bioPosted: 'posted' })).toBe(false);
  });

  it('requires at least the minimum tangible hours', () => {
    expect(
      isQualifiedForBio({ ...qualified, totalTangibleHrs: BIO_MIN_TANGIBLE_HOURS - 0.01 }),
    ).toBe(false);
    expect(isQualifiedForBio({ ...qualified, totalTangibleHrs: BIO_MIN_TANGIBLE_HOURS })).toBe(
      true,
    );
  });

  it('requires at least the minimum valid weekly summaries', () => {
    expect(
      isQualifiedForBio({ ...qualified, weeklySummariesCount: BIO_MIN_VALID_SUMMARIES - 1 }),
    ).toBe(false);
    expect(
      isQualifiedForBio({ ...qualified, weeklySummariesCount: BIO_MIN_VALID_SUMMARIES }),
    ).toBe(true);
  });

  // Reported 2026-10-13: 80+ hours and 60+ days in team, but only 3 valid summaries.
  it('does not qualify on hours and tenure alone', () => {
    expect(
      isQualifiedForBio({ ...qualified, daysInTeam: 400, weeklySummariesCount: 3 }),
    ).toBe(false);
  });

  it('ignores daysInTeam entirely', () => {
    expect(isQualifiedForBio({ ...qualified, daysInTeam: 1 })).toBe(true);
  });

  it('accepts a numeric string for weeklySummariesCount', () => {
    expect(isQualifiedForBio({ ...qualified, weeklySummariesCount: '8' })).toBe(true);
    expect(isQualifiedForBio({ ...qualified, weeklySummariesCount: '3' })).toBe(false);
  });

  it('does not qualify when the row is missing or the fields are absent', () => {
    expect(isQualifiedForBio(null)).toBe(false);
    expect(isQualifiedForBio(undefined)).toBe(false);
    expect(isQualifiedForBio({})).toBe(false);
    expect(isQualifiedForBio({ ...qualified, weeklySummariesCount: undefined })).toBe(false);
    expect(isQualifiedForBio({ ...qualified, weeklySummariesCount: null })).toBe(false);
    expect(isQualifiedForBio({ ...qualified, totalTangibleHrs: undefined })).toBe(false);
  });
});
