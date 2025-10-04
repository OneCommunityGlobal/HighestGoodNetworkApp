import { useSelector } from 'react-redux';
import EventParticipationHeader from './EventParticipationHeader';
import EngagementSummaryCards from './EngagementSummaryCards';
import EventTypePieChart from './EventTypePieChart';
import EngagementBarChart from './EngagementBarChart';
import AnalyticsNavigation from './AnalyticsNavigation';
import MyCases from './MyCases';
import DropOffTracking from './DropOffTracking';
import NoShowInsights from './NoShowInsights';
import styles from './Participation.module.css';

function LandingPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <div
      className={`${styles.participationLandingPage} ${
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
      <div className={styles.analyticsSection}>
        <DropOffTracking />
        <NoShowInsights />
      </div>
      <MyCases />
      <AnalyticsNavigation />
    </div>
  );
}

export default LandingPage;
