/* eslint-disable testing-library/no-node-access */
import { useSelector } from 'react-redux';
import { useRef, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import EventParticipationHeader from './EventParticipationHeader';
import EngagementSummaryCards from './EngagementSummaryCards';
import EventTypePieChart from './EventTypePieChart';
import EngagementBarChart from './EngagementBarChart';
import AnalyticsNavigation from './AnalyticsNavigation';
import MyCases from './MyCases';
import DropOffTracking from './DropOffTracking';
import NoShowInsights from './NoShowInsights';
import styles from './Participation.module.css';

function EventParticipation() {
  const darkMode = useSelector(state => state.theme.darkMode);
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
    const toggled = moreBtn?.textContent?.toLowerCase().includes('more') ?? false;
    if (toggled) moreBtn.click();

    const prevTitle = document.title;
    document.title = 'event_participation';

    setTimeout(() => {
      globalThis.print();

      setTimeout(() => {
        if (toggled) moreBtn.click();

        delete document.documentElement.dataset.exporting;
        document.title = prevTitle;
        setExporting(false);
      }, 100);
    }, 500);
  }, [exporting]);

  return (
    <div ref={exportRef}
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

      <EventParticipationHeader />
      <EngagementSummaryCards />
      <div className={styles.chartsSection}>
        <div className={styles.chartsRow}>
          <EventTypePieChart />
          <EngagementBarChart />
        </div>
      </div>

      <MyCases />
      <div className={`${styles.analyticsSection}`}>
        <DropOffTracking />
        <NoShowInsights />
      </div>
      <AnalyticsNavigation />

      {/* Print-only footer note */}
    </div>
  );
}

export default EventParticipation;
