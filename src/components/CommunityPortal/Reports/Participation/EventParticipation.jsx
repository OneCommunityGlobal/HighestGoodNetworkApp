/* eslint-disable testing-library/no-node-access */
import { useSelector } from 'react-redux';
import { useRef } from 'react';
import { useHistory } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import EventParticipationHeader from './EventParticipationHeader';
import EngagementSummaryCards from './EngagementSummaryCards';
import EventTypePieChart from './EventTypePieChart';
import EngagementBarChart from './EngagementBarChart';
import AnalyticsNavigation from './AnalyticsNavigation';
import MyCases from './MyCases';
import DropOffTracking from './DropOffTracking';
import NoShowInsights from './NoShowInsights';
import styles from './Participation.module.css';
import ChartsSection from './ChartsSection';

function EventParticipation() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const exportRef = useRef(null);
  // const [selectedOrganizer, setSelectedOrganizer] = useState('All Organizers');

  return (
    <div
      ref={exportRef}
      className={`${styles.participationLandingPage} ${darkMode ? styles.darkMode : ''}`}
    >
      {/* Print-only page title header */}
      <header
        className={`${styles.landingPageHeaderContainer} ${styles.avoidBreak} ${styles.noPrintGap}`}
      >
        <h1 className={styles.landingPageHeader}>Social And Recreational Management</h1>
        <button
          className={`${styles.savePdfBtn} ${darkMode ? '' : styles.savePdfBtnLight} ${
            styles.noPrint
          }`}
          onClick={handleSaveAsPDF}
          disabled={exporting}
          aria-busy={exporting}
        >
          {exporting ? 'Preparing…' : '📄 Save as PDF'}
        </button>
      </header>

      <div>
        <MyCases darkMode={darkMode} />
        <div className={styles.analyticsSection}>
          <DropOffTracking darkMode={darkMode} />
          <NoShowInsights darkMode={darkMode} />
        </div>
      </div>

      <div className={styles.subPageNav}>
        <button
          className={`${styles.subPageBtn} ${darkMode ? styles.subPageBtnDark : ''}`}
          onClick={() => history.push('/communityportal/reports/participation/demographics')}
        >
          Demographics
        </button>
        <button
          className={`${styles.subPageBtn} ${darkMode ? styles.subPageBtnDark : ''}`}
          onClick={() => history.push('/communityportal/reports/participation/personalization')}
        >
          Personalization
        </button>
      </div>

      <MyCases />
      <div className={`${styles.analyticsSection}`}>
        <DropOffTracking />
        <NoShowInsights />
      </div>
      <ChartsSection />

      {/* ACTIONABLE INSIGHTS SECTION */}
      <div
        className={`${styles.actionableSection} ${darkMode ? styles.actionableSectionDark : ''}`}
      >
        <h3 className={styles.actionableHeader}>Actionable insights</h3>

        <div className={styles.actionableGrid}>
          <div className={styles.actionCard}>
            <h4 className={styles.actionTitle}>High no-show rate detected</h4>
            <p className={styles.actionDescription}>
              Yoga Class events show an unusual increase in no-show percentage this month.
            </p>
            <span className={styles.actionTrendUp}>↑ 12%</span>
          </div>

          <div className={styles.actionCard}>
            <h4 className={styles.actionTitle}>Weekend events perform better</h4>
            <p className={styles.actionDescription}>
              Attendance is consistently higher on Saturdays compared to weekdays.
            </p>
            <span className={styles.actionTrendUp}>↑ 8%</span>
          </div>
          <AnalyticsNavigation />

          <div className={`${styles.printOnly} ${styles.printFooter}`}>
            Generated from Event Participation
            <div className={styles.actionCard}>
              <h4 className={styles.actionTitle}>Drop-off rate reduction opportunity</h4>
              <p className={styles.actionDescription}>
                Average event drop-off decreases when host reminders are sent earlier.
              </p>
              <span className={styles.actionTrendDown}>↓ 5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventParticipation;
