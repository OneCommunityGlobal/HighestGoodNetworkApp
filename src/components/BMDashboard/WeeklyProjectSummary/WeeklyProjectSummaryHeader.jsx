import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment-timezone';
import {
  setProjectFilter,
  setDateRangeFilter,
  setComparisonPeriodFilter,
} from '../../../actions/bmdashboard/weeklyProjectSummaryActions';
import styles from './WeeklyProjectSummary.module.css';

const ALL_PROJECTS_OPTION = 'One Community';
const COMPLETED_WEEKS_OPTIONS = 8;

function formatWeekLabel(weeksAgo) {
  const start = moment()
    .subtract(weeksAgo, 'week')
    .startOf('week')
    .format('MMM DD, YY');
  const end = moment()
    .subtract(weeksAgo, 'week')
    .endOf('week')
    .format('MMM DD, YY');
  return `${start} - ${end}`;
}

export default function WeeklyProjectSummaryHeader({
  handleSaveAsPDF,
  isGeneratingPDF = false,
  bmProjects = [],
}) {
  const dispatch = useDispatch();
  const projectFilter = useSelector(state => state.weeklyProjectSummary?.projectFilter);
  const dateRangeFilter = useSelector(state => state.weeklyProjectSummary?.dateRangeFilter);
  const comparisonPeriodFilter = useSelector(
    state => state.weeklyProjectSummary?.comparisonPeriodFilter,
  );
  const darkMode = useSelector(state => state.theme.darkMode);

  const projectOptions = useMemo(() => {
    const realNames = bmProjects.map(p => p.name).filter(Boolean);
    return [ALL_PROJECTS_OPTION, ...new Set(realNames)];
  }, [bmProjects]);

  // Last N completed weeks, most recent first (index 0 = last completed week).
  const dateRangeOptions = useMemo(
    () => Array.from({ length: COMPLETED_WEEKS_OPTIONS }, (_, i) => formatWeekLabel(i + 1)),
    [],
  );

  // The comparison period is relative to whichever date range is selected, not fixed to
  // "today" — picking an older week should shift what it's compared against too.
  const selectedWeeksAgo = useMemo(() => {
    const idx = dateRangeOptions.indexOf(dateRangeFilter);
    return idx === -1 ? 1 : idx + 1;
  }, [dateRangeOptions, dateRangeFilter]);

  const comparisonOptions = useMemo(
    () => [formatWeekLabel(selectedWeeksAgo + 1), formatWeekLabel(selectedWeeksAgo + 4)],
    [selectedWeeksAgo],
  );

  useEffect(() => {
    dispatch(setDateRangeFilter(dateRangeOptions[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (!comparisonOptions.includes(comparisonPeriodFilter)) {
      dispatch(setComparisonPeriodFilter(comparisonOptions[0]));
    }
  }, [comparisonOptions, comparisonPeriodFilter, dispatch]);

  return (
    <div className={`${styles.weeklySummaryHeaderWrapper} ${darkMode ? styles.darkMode : ''}`}>
      <header className={`${styles.weeklySummaryHeaderContainer}`}>
        <h1 className={`${styles.weeklySummaryHeaderTitle}`}>Weekly Project Summary</h1>

        <div className={`${styles.weeklySummaryHeaderControls}`}>
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

          <Button
            className={`${styles.weeklySummaryShareBtn}`}
            onClick={handleSaveAsPDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <span className={styles.spinner} /> Generating PDF...
              </>
            ) : (
              'Share PDF'
            )}
          </Button>
        </div>
      </header>
    </div>
  );
}

WeeklyProjectSummaryHeader.propTypes = {
  handleSaveAsPDF: PropTypes.func.isRequired,
  isGeneratingPDF: PropTypes.bool,
  bmProjects: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
};
