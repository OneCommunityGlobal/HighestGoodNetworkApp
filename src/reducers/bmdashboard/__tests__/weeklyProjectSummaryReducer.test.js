import { weeklyProjectSummaryReducer } from '../weeklyProjectSummaryReducer';

describe('weeklyProjectSummaryReducer', () => {
  it('defaults the comparison period to Week Over Week so Project Status shows trend lines', () => {
    const state = weeklyProjectSummaryReducer(undefined, { type: '@@INIT' });

    expect(state.comparisonPeriodFilter).toBe('Week Over Week');
  });
});
