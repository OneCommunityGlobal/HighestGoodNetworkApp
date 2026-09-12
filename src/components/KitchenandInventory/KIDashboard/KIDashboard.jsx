import React from 'react';
import styles from './KIDashboard.module.css';

const metrics = [
  {
    title: 'Total Ingredients',
    value: 247,
    info: '+12 this week',
    icon: '◈',
    iconClass: 'blue',
  },
  {
    title: 'Onsite Grown',
    value: 89,
    info: '36% of total',
    icon: '♧',
    iconClass: 'green',
  },
  {
    title: 'Upcoming Meals',
    value: 28,
    info: 'Next 7 days',
    icon: '▣',
    iconClass: 'purple',
  },
  {
    title: 'Pending Orders',
    value: 3,
    info: '$1,247 total',
    icon: '🛒',
    iconClass: 'orange',
  },
];

const KIDashboard = () => {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Real-time overview of kitchen operations</p>
        </div>

        <button type="button" className={styles.priorityButton}>
          <span className={styles.bellIcon}>♧</span>
          <span>Priority Ingredients</span>
          <span className={styles.priorityBadge}>9</span>
        </button>
      </header>

      {/* Alerts */}
      <section className={styles.alerts}>
        <div className={`${styles.alertBanner} ${styles.lowStockAlert}`}>
          <div className={styles.alertBannerIcon}>!</div>

          <div className={styles.alertBannerContent}>
            <h2>Low Stock Alert</h2>
            <p>Olive oil needs reordering (2 days remaining)</p>
          </div>
        </div>

        <div className={`${styles.alertBanner} ${styles.harvestAlert}`}>
          <div className={styles.alertBannerIcon}>□</div>

          <div className={styles.alertBannerContent}>
            <h2>Harvest Upcoming</h2>
            <p>Tomatoes ready for harvest in 3 days (estimated 25 lbs)</p>
          </div>
        </div>

        <div className={`${styles.alertBanner} ${styles.seasonalAlert}`}>
          <div className={styles.alertBannerIcon}>⌁</div>

          <div className={styles.alertBannerContent}>
            <h2>Seasonal Recommendation</h2>
            <p>Fall harvest available: Consider root vegetable dishes</p>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className={styles.metricsGrid}>
        {metrics.map(metric => (
          <div className={styles.metricCard} key={metric.title}>
            <div className={styles.metricHeader}>
              <h2>{metric.title}</h2>

              <span
                className={`${styles.metricIcon} ${styles[metric.iconClass]}`}
                aria-hidden="true"
              >
                {metric.icon}
              </span>
            </div>

            <div className={styles.metricValue}>{metric.value}</div>

            <p className={styles.metricInfo}>{metric.info}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default KIDashboard;
