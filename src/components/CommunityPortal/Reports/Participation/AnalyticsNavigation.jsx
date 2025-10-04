import { useSelector } from 'react-redux';
import styles from './Participation.module.css';

function AnalyticsNavigation() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const navigationItems = [
    {
      title: 'Virtual vs. In-Person Attendance',
      description: 'Compare attendance patterns between virtual and in-person events',
      icon: '💻',
      link: '/communityportal/reports/participation/virtual-vs-inperson',
      stats: '65% Virtual, 35% In-Person',
    },
    {
      title: 'Estimated Event Value',
      description: 'Calculate and analyze the estimated value of different event types',
      icon: '💰',
      link: '/communityportal/reports/participation/event-value',
      stats: 'Avg Value: $2,400',
    },
    {
      title: 'Participation Trends',
      description: 'Track participation trends over time and identify patterns',
      icon: '📈',
      link: '/communityportal/reports/participation/trends',
      stats: '+15% Growth',
    },
    {
      title: 'Event Performance Metrics',
      description: 'Detailed performance metrics for individual events',
      icon: '📊',
      link: '/communityportal/reports/participation/performance',
      stats: '24 Active Events',
    },
  ];

  return (
    <div
      className={`${styles.analyticsNavigation} ${darkMode ? styles.analyticsNavigationDark : ''}`}
    >
      <h2 className={`${styles.sectionTitle} ${darkMode ? styles.sectionTitleDark : ''}`}>
        Detailed Analytics
      </h2>
      <p className={`${styles.sectionSubtitle} ${darkMode ? styles.sectionSubtitleDark : ''}`}>
        Explore detailed analytics and insights for event participation
      </p>

      <div className={styles.navigationGrid}>
        {navigationItems.map((item, index) => (
          <a
            key={index}
            href={item.link}
            className={`${styles.navigationCard} ${darkMode ? styles.navigationCardDark : ''}`}
          >
            <div className={styles.cardIcon}>{item.icon}</div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDescription}>{item.description}</p>
              <div className={styles.cardStats}>{item.stats}</div>
            </div>
            <div className={styles.cardArrow}>→</div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default AnalyticsNavigation;
