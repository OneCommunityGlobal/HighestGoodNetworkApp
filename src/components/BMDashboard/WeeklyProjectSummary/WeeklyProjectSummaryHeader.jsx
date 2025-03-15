import { useState, useEffect, useMemo } from 'react';
import { Button, Input } from 'reactstrap';
import { useSelector } from 'react-redux';
import moment from 'moment-timezone';
import './WeeklyProjectSummary.css';

export default function WeeklyProjectSummaryHeader() {
  const [projectFilter, setProjectFilter] = useState('One Community');
  const [selectDateRange, setSelectDateRange] = useState('');
  const [comparisonPeriod, setComparisonPeriod] = useState('');
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
    setSelectDateRange(lastWeek);
    setComparisonPeriod(prevWeek);
  }, []);

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
            onChange={e => setProjectFilter(e.target.value)}
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
            value={selectDateRange}
            onChange={e => setSelectDateRange(e.target.value)}
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
            value={comparisonPeriod}
            onChange={e => setComparisonPeriod(e.target.value)}
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
