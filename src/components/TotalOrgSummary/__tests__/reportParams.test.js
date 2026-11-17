import { formatReportRangeLabel, parseReportParams } from '../reportParams';

describe('parseReportParams', () => {
  it('returns null on a normal visit with no params', () => {
    expect(parseReportParams('')).toBeNull();
  });

  it('reads the period, comparison and explicit comparison range', () => {
    const search =
      '?comparison=Month%20Over%20Month&from=2026-09-27&to=2026-10-24&compareFrom=2026-08-30&compareTo=2026-09-26';
    expect(parseReportParams(search)).toEqual({
      from: '2026-09-27',
      to: '2026-10-24',
      comparison: 'Month Over Month',
      comparisonRange: { start: '2026-08-30', end: '2026-09-26' },
    });
  });

  it('falls back to the default comparison range when compare dates are missing', () => {
    const result = parseReportParams(
      '?comparison=Week%20Over%20Week&from=2026-10-18&to=2026-10-24',
    );
    expect(result.comparison).toBe('Week Over Week');
    expect(result.comparisonRange).toBeNull();
  });

  it('treats an unknown comparison as No Comparison and ignores compare dates', () => {
    const result = parseReportParams(
      '?comparison=Bogus&from=2026-10-18&to=2026-10-24&compareFrom=2026-10-11&compareTo=2026-10-17',
    );
    expect(result.comparison).toBe('No Comparison');
    expect(result.comparisonRange).toBeNull();
  });

  it('rejects malformed, impossible or reversed dates', () => {
    expect(parseReportParams('?from=10/18/2026&to=10/24/2026')).toBeNull();
    expect(parseReportParams('?from=2026-02-30&to=2026-03-02')).toBeNull();
    expect(parseReportParams('?from=2026-10-24&to=2026-10-18')).toBeNull();
    expect(parseReportParams('?from=2026-10-18')).toBeNull();
  });

  it('ignores an invalid compare range but keeps the period', () => {
    const result = parseReportParams(
      '?comparison=Year%20Over%20Year&from=2026-10-18&to=2026-10-24&compareFrom=nope&compareTo=2026-10-17',
    );
    expect(result.comparison).toBe('Year Over Year');
    expect(result.comparisonRange).toBeNull();
  });
});

describe('formatReportRangeLabel', () => {
  it('joins the two dates', () => {
    expect(formatReportRangeLabel('2026-10-18', '2026-10-24')).toBe('2026-10-18 - 2026-10-24');
  });
});
