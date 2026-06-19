/* eslint-disable testing-library/no-node-access */
import { useSelector } from 'react-redux';
import { useRef, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import MyCases from './MyCases';
import DropOffTracking from './DropOffTracking';
import NoShowInsights from './NoShowInsights';
import styles from './Participation.module.css';
import ChartsSection from './ChartsSection';

function EventParticipation() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const exportRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState('All Organizers');

  const handleSaveAsPDF = useCallback(() => {
    if (globalThis.window === undefined || globalThis.document === undefined) return;
    if (exporting) return;
    setExporting(true);

    document.documentElement.dataset.exporting = 'true';

    // Expand "More" so all visible items are included
    const moreBtn = document.querySelector('.more-btn-global');
    const shouldExpand = moreBtn?.textContent?.toLowerCase().includes('more');
    if (shouldExpand) moreBtn.click();

    const prevTitle = document.title;
    document.title = 'event_participation';

    setTimeout(() => {
      globalThis.window.print();

      setTimeout(() => {
        if (shouldExpand) moreBtn.click();

        delete document.documentElement.dataset.exporting;
        document.title = prevTitle;
        setExporting(false);
      }, 120);
    }, 500);
  }, [exporting]);

  return (
    <div
      ref={exportRef}
      className={`participation-landing-page-global ${styles.participationLandingPage} ${
        darkMode ? styles.participationLandingPageDark : ''
      }`}
    >
      {/* Print-only page title header */}
      <header
        className={`${styles.landingPageHeaderContainer} ${styles.avoidBreak} ${styles.noPrintGap}`}
      >
        <h1
          className={`${styles.landingPageHeader} ${darkMode ? styles.landingPageHeaderDark : ''}`}
        >
          Social And Recreational Management
        </h1>
        <div className={styles.headerActions}>
          <button
            className={`${styles.savePdfBtn} ${
              darkMode ? styles.savePdfBtnDark : styles.savePdfBtnLight
            } ${styles.noPrint}`}
            onClick={handleSaveAsPDF}
            disabled={exporting}
            aria-busy={exporting}
          >
            {exporting ? (
              'Preparing…'
            ) : (
              <>
                <FontAwesomeIcon icon={faFilePdf} style={{ marginRight: '6px' }} />
                Save as PDF
              </>
            )}
          </button>

          <select
            className={`${styles.organizerDropdown} ${
              darkMode ? styles.organizerDropdownDark : ''
            }`}
            value={selectedOrganizer}
            onChange={e => setSelectedOrganizer(e.target.value)}
          >
            <option value="All Organizers">All Organizers</option>
            <option value="Organizer 1">Organizer 1</option>
            <option value="Organizer 2">Organizer 2</option>
            <option value="Organizer 3">Organizer 3</option>
          </select>
        </div>
      </header>

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
