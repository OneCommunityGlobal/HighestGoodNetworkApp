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
import EventPopularityBreakdown from './EventPopularityBreakdown';
import EngagementVisuals from './EngagementVisuals';
import styles from './Participation.module.css';

function EventParticipation() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const exportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const handleSaveAsPDF = useCallback(() => {
    if (isExporting) return;

    setIsExporting(true);
    document.documentElement.dataset.exporting = 'true';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        delete document.documentElement.dataset.exporting;
        setIsExporting(false);
      });
    });
  }, [isExporting]);

  return (
    <div
      ref={exportRef}
      className={`participation-landing-page-global ${styles.participationLandingPage} ${
        darkMode ? styles.participationLandingPageDark : ''
      }`}
    >
      <EventParticipationHeader onSaveAsPDF={handleSaveAsPDF} isExporting={isExporting} />
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

      <EventPopularityBreakdown />

      <EngagementVisuals />

      <AnalyticsNavigation />

      {/* Print-only footer note */}
    </div>
  );
}

export default EventParticipation;
