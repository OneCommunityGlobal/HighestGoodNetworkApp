import { useSelector } from 'react-redux';
import styles from './Participation.module.css';

function EngagementSummaryCards() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const engagementData = {
    averageAttendance: 35,
    highestRatedEvent: {
      name: 'Yoga Class',
      rating: 4.8,
      participants: 45,
    },
    mostPopularEvent: {
      name: 'Fitness Bootcamp',
      attendance: 55,
      growth: '+12%',
    },
    engagementRate: 78,
  };

  return (
    <div className={`${styles.engagementSection} ${darkMode ? styles.engagementSectionDark : ''}`}>
      <h2 className={`${styles.sectionTitle} ${darkMode ? styles.sectionTitleDark : ''}`}>
        Engagement Summary
      </h2>

      <div className={styles.engagementCards}>
        <div className={`${styles.engagementCard} ${darkMode ? styles.engagementCardDark : ''}`}>
          <div className={styles.cardIcon}>📊</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{engagementData.averageAttendance}</div>
            <div className={styles.cardLabel}>Average Attendance</div>
            <div className={styles.cardSubtext}>Across all events</div>
          </div>
        </div>

        <div className={`${styles.engagementCard} ${darkMode ? styles.engagementCardDark : ''}`}>
          <div className={styles.cardIcon}>⭐</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{engagementData.highestRatedEvent.rating}</div>
            <div className={styles.cardLabel}>Highest Rated Event</div>
            <div className={styles.cardSubtext}>{engagementData.highestRatedEvent.name}</div>
          </div>
        </div>

        <div className={`${styles.engagementCard} ${darkMode ? styles.engagementCardDark : ''}`}>
          <div className={styles.cardIcon}>🔥</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{engagementData.mostPopularEvent.attendance}</div>
            <div className={styles.cardLabel}>Most Popular Event</div>
            <div className={styles.cardSubtext}>
              {engagementData.mostPopularEvent.name} {engagementData.mostPopularEvent.growth}
            </div>
          </div>
        </div>

        <div className={`${styles.engagementCard} ${darkMode ? styles.engagementCardDark : ''}`}>
          <div className={styles.cardIcon}>📈</div>
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{engagementData.engagementRate}%</div>
            <div className={styles.cardLabel}>Overall Engagement</div>
            <div className={styles.cardSubtext}>Event participation rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EngagementSummaryCards;
