import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import WeeklyProjectSummaryHeader from '../WeeklyProjectSummaryHeader';
import {
  SET_COMPARISON_PERIOD_FILTER,
  SET_DATE_RANGE_FILTER,
} from '../../../../constants/bmdashboard/weeklyProjectSummaryConstants';

const mockStore = configureMockStore([]);

const renderHeader = (comparisonPeriodFilter = 'Week Over Week') => {
  const store = mockStore({
    theme: { darkMode: false },
    weeklyProjectSummary: {
      projectFilter: 'One Community',
      dateRangeFilter: '',
      comparisonPeriodFilter,
    },
  });
  render(
    <Provider store={store}>
      <WeeklyProjectSummaryHeader handleSaveAsPDF={vi.fn()} />
    </Provider>,
  );
  return { store };
};

const dispatchedPayload = (store, type) =>
  store
    .getActions()
    .filter(action => action.type === type)
    .map(action => action.payload);

describe('WeeklyProjectSummaryHeader default comparison', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const setToday = isoDate => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${isoDate}T12:00:00`));
  };

  it('defaults to the last full week compared Week Over Week (mid-week)', () => {
    setToday('2026-11-06'); // Friday
    const { store } = renderHeader();

    expect(dispatchedPayload(store, SET_DATE_RANGE_FILTER)).toEqual(['Oct 25, 26 - Oct 31, 26']);
    expect(dispatchedPayload(store, SET_COMPARISON_PERIOD_FILTER)).toEqual(['Week Over Week']);
    expect(screen.getByRole('button', { name: 'Week Over Week' })).toBeInTheDocument();
  });

  it('never uses the partial current week on a Saturday', () => {
    setToday('2026-11-07'); // Saturday, current week not finished
    const { store } = renderHeader();

    expect(dispatchedPayload(store, SET_DATE_RANGE_FILTER)).toEqual(['Oct 25, 26 - Oct 31, 26']);
  });

  it('moves to the just-completed week on a Sunday', () => {
    setToday('2026-11-08'); // Sunday
    const { store } = renderHeader();

    expect(dispatchedPayload(store, SET_DATE_RANGE_FILTER)).toEqual(['Nov 01, 26 - Nov 07, 26']);
  });

  it('lets users pick another comparison period', () => {
    setToday('2026-11-06');
    const { store } = renderHeader();

    fireEvent.click(screen.getByRole('button', { name: 'Week Over Week' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Month Over Month' }));

    expect(dispatchedPayload(store, SET_COMPARISON_PERIOD_FILTER)).toEqual([
      'Week Over Week',
      'Month Over Month',
    ]);
  });
});
