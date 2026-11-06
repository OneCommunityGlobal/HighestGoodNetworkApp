import { calculateComparisonDates, DEFAULT_COMPARISON } from '../comparisonDateUtils';
import { weeklyProjectSummaryReducer } from '../../../../reducers/bmdashboard/weeklyProjectSummaryReducer';

describe('Weekly Project Summary comparison defaults', () => {
  it('defaults the comparison period to Week Over Week', () => {
    expect(DEFAULT_COMPARISON).toBe('Week Over Week');
    expect(weeklyProjectSummaryReducer(undefined, { type: '@@INIT' }).comparisonPeriodFilter).toBe(
      'Week Over Week',
    );
  });

  it('compares a full Sun–Sat week with the full week before it, with no overlap', () => {
    expect(calculateComparisonDates('Week Over Week', '2026-10-25', '2026-10-31')).toEqual({
      comparisonStartDate: '2026-10-18',
      comparisonEndDate: '2026-10-24',
    });
  });
});
