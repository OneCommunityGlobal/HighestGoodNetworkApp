import PropTypes from 'prop-types';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Loading from '../../common/Loading';
import EditableInfoModal from '../../UserProfile/EditableModal/EditableInfoModal';
import useContributorsData from './useContributorsData';
import styles from './TotalReport.module.css';
import TotalReportBarGraph from './TotalReportBarGraph';

const MIN_DATE = new Date('01/01/2010');

const formatDate = date =>
  date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

// Renders the summary stats and charts for a single period.
function ContributorsPeriodPanel({ startDate, endDate, data, idSuffix, title }) {
  const {
    contributors,
    totalTangibleTime,
    showMonthly,
    showYearly,
    contributorsInMonth,
    contributorsInYear,
  } = data;

  return (
    <div className={styles.comparisonPanel}>
      {title && <div className={styles.panelTitle}>{title}</div>}
      <div className={styles.totalPeriod}>
        In the period from {formatDate(startDate)} to {formatDate(endDate)}:
      </div>
      <div className={styles.totalItem}>
        <div className={styles.totalNumber}>{contributors.length}</div>
        <div className={styles.totalText}>members have contributed more than 10 hours.</div>
      </div>
      <div className={styles.totalItem}>
        <div className={styles.totalNumber}>{totalTangibleTime.toFixed(2)}</div>
        <div className={styles.totalText}>hours of tangible time have been logged.</div>
      </div>
      <div>
        {showMonthly && contributorsInMonth.length > 0 && (
          <TotalReportBarGraph barData={contributorsInMonth} range="month" idSuffix={idSuffix} />
        )}
        {showYearly && contributorsInYear.length > 0 && (
          <TotalReportBarGraph barData={contributorsInYear} range="year" idSuffix={idSuffix} />
        )}
      </div>
    </div>
  );
}

ContributorsPeriodPanel.propTypes = {
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
  data: PropTypes.shape({
    contributors: PropTypes.arrayOf(PropTypes.shape({})),
    totalTangibleTime: PropTypes.number,
    showMonthly: PropTypes.bool,
    showYearly: PropTypes.bool,
    contributorsInMonth: PropTypes.arrayOf(PropTypes.shape({})),
    contributorsInYear: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  idSuffix: PropTypes.string,
  title: PropTypes.string,
};

ContributorsPeriodPanel.defaultProps = {
  idSuffix: '',
  title: '',
};

function TotalContributorsReport({ startDate, endDate, userProfiles, darkMode, userRole }) {
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  // Default the comparison window to the equal-length period immediately
  // preceding the primary start date (e.g. 2023-2024 vs 2024-2025).
  const [compareStartDate, setCompareStartDate] = useState(() => {
    const length = endDate - startDate;
    const start = new Date(startDate.getTime() - length);
    return start < MIN_DATE ? MIN_DATE : start;
  });
  const [compareEndDate, setCompareEndDate] = useState(() => new Date(startDate));

  const primary = useContributorsData({ startDate, endDate, userProfiles, enabled: true });
  const comparison = useContributorsData({
    startDate: compareStartDate,
    endDate: compareEndDate,
    userProfiles,
    enabled: comparisonEnabled,
  });

  const onToggleComparison = e => {
    const enabled = e.target.checked;
    if (enabled) {
      // Default the comparison to the equal-length period immediately preceding
      // the currently-selected primary range.
      const length = endDate - startDate;
      const start = new Date(startDate.getTime() - length);
      setCompareStartDate(start < MIN_DATE ? MIN_DATE : start);
      setCompareEndDate(new Date(startDate));
    }
    setComparisonEnabled(enabled);
  };

  const onCompareStartDateChange = date => {
    if (date && date <= compareEndDate) {
      setCompareStartDate(date);
    }
  };

  const onCompareEndDateChange = date => {
    if (date && date >= compareStartDate) {
      setCompareEndDate(date);
    }
  };

  if (primary.loading) {
    return <Loading darkMode={darkMode} />;
  }

  const today = new Date();

  return (
    <div className={`${styles.totalContainer} ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>
      <div className="d-flex align-items-center">
        <h2 className={`${styles.totalTitle} ${darkMode ? 'text-azure' : ''}`}>
          Contributors Report
        </h2>
        <EditableInfoModal
          areaName="contributorsReportInfo"
          areaTitle="Contributors Report"
          role={userRole}
          fontSize={15}
          defaultText="Click this to see only people who logged/contributed a minimum of 10 tangible hours..."
          isPermissionPage
          darkMode={darkMode}
        />
      </div>

      <div className={styles.comparisonControls}>
        <label className={styles.comparisonToggle} htmlFor="contributors-compare-toggle">
          <input
            id="contributors-compare-toggle"
            type="checkbox"
            checked={comparisonEnabled}
            onChange={onToggleComparison}
          />
          <span>Compare to another period</span>
        </label>
        {comparisonEnabled && (
          <div className={styles.comparePickers}>
            <div className={styles.comparePickerItem}>
              <label htmlFor="contributors-compare-start">Compare Start Date</label>
              <DatePicker
                id="contributors-compare-start"
                selected={compareStartDate}
                minDate={MIN_DATE}
                maxDate={today}
                onChange={onCompareStartDateChange}
                className={`form-control ${
                  darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                }`}
              />
            </div>
            <div className={styles.comparePickerItem}>
              <label htmlFor="contributors-compare-end">Compare End Date</label>
              <DatePicker
                id="contributors-compare-end"
                selected={compareEndDate}
                minDate={MIN_DATE}
                maxDate={today}
                onChange={onCompareEndDateChange}
                className={`form-control ${
                  darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {comparisonEnabled ? (
        <div className={styles.comparisonGrid}>
          <ContributorsPeriodPanel
            startDate={startDate}
            endDate={endDate}
            data={primary}
            idSuffix="-primary"
            title="Selected period"
          />
          {comparison.loading ? (
            <div className={styles.comparisonPanel}>
              <Loading darkMode={darkMode} />
            </div>
          ) : (
            <ContributorsPeriodPanel
              startDate={compareStartDate}
              endDate={compareEndDate}
              data={comparison}
              idSuffix="-compare"
              title="Comparison period"
            />
          )}
        </div>
      ) : (
        <ContributorsPeriodPanel
          startDate={startDate}
          endDate={endDate}
          data={primary}
          idSuffix="-primary"
        />
      )}
    </div>
  );
}

TotalContributorsReport.propTypes = {
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
  userProfiles: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
    }),
  ),
  darkMode: PropTypes.bool,
  userRole: PropTypes.string,
};

TotalContributorsReport.defaultProps = {
  userProfiles: [],
  darkMode: false,
  userRole: '',
};

export default TotalContributorsReport;
