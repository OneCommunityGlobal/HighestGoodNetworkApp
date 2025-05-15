import { useEffect, useMemo } from 'react';
import { Input, Button } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment-timezone';
import {
  setProjectFilter,
  setDateRangeFilter,
  setComparisonPeriodFilter,
} from '../../../actions/bmdashboard/weeklyProjectSummaryActions';
import './WeeklyProjectSummary.css';

export default function WeeklyProjectSummaryHeader() {
  const dispatch = useDispatch();
  const projectFilter = useSelector(state => state.weeklyProjectSummary.projectFilter);
  const dateRangeFilter = useSelector(state => state.weeklyProjectSummary.dateRangeFilter);
  const comparisonPeriodFilter = useSelector(
    state => state.weeklyProjectSummary.comparisonPeriodFilter,
  );
  const darkMode = useSelector(state => state.theme.darkMode);

  const getLastTwoCompletedWeeks = () => {
    // const now = moment().tz('America/Los_Angeles');

    const lastWeekStart = moment()
      .subtract(1, 'week')
      .startOf('week')
      .format('MMM DD, YY');
    const lastWeekEnd = moment()
      .subtract(1, 'week')
      .endOf('week')
      .format('MMM DD, YY');

    const prevWeekStart = moment()
      .subtract(2, 'weeks')
      .startOf('week')
      .format('MMM DD, YY');
    const prevWeekEnd = moment()
      .subtract(2, 'weeks')
      .endOf('week')
      .format('MMM DD, YY');

    return {
      lastWeek: `${lastWeekStart} - ${lastWeekEnd}`,
      prevWeek: `${prevWeekStart} - ${prevWeekEnd}`,
    };
  };

  useEffect(() => {
    const { lastWeek, prevWeek } = getLastTwoCompletedWeeks();
    dispatch(setDateRangeFilter(lastWeek));
    dispatch(setComparisonPeriodFilter(prevWeek));
  }, [dispatch]);

  const projectOptions = useMemo(() => ['One Community'], []);
  const dateRangeOptions = useMemo(() => [getLastTwoCompletedWeeks().lastWeek], []);
  const comparisonOptions = useMemo(() => [getLastTwoCompletedWeeks().prevWeek], []);

  return (
    <div className={`weekly-summary-header-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <header className="weekly-summary-header-container">
        <h1 className="weekly-summary-header-title">Weekly Project Summary</h1>

        <div className="weekly-summary-header-controls">
          <Input
            type="select"
            value={projectFilter}
            onChange={e => dispatch(setProjectFilter(e.target.value))}
            aria-label="Project Filter"
          >
            {projectOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Input>

          <Input
            type="select"
            value={dateRangeFilter}
            onChange={e => dispatch(setDateRangeFilter(e.target.value))}
            aria-label="Select Date Range"
          >
            {dateRangeOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Input>

          <Input
            type="select"
            value={comparisonPeriodFilter}
            onChange={e => dispatch(setComparisonPeriodFilter(e.target.value))}
            aria-label="Comparison Period"
          >
            {comparisonOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Input>

          <Button className="weekly-summary-share-btn">Share PDF</Button>
        </div>
      </header>
    </div>
  );
}
