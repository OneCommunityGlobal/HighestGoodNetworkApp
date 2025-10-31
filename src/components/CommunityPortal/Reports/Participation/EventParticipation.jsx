/* eslint-disable testing-library/no-node-access */
import { useSelector } from 'react-redux';
import { useRef, useState, useCallback } from 'react';
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
    <div
      ref={exportRef}
      className={`participation-landing-page-global ${styles.participationLandingPage} ${
        darkMode ? styles.participationLandingPageDark : ''
      }`}
    >
      <EventParticipationHeader />
      <EngagementSummaryCards />
      <div className={styles.chartsSection}>
        <div className={styles.chartsRow}>
          <EventTypePieChart />
          <EngagementBarChart />
        </div>
      </div>
      <AnalyticsNavigation />
      <div className={styles.analyticsSection}>
        <DropOffTracking />
        <NoShowInsights />
      </div>
      <MyCases />
    </div>
  );
}

export default EventParticipation;
