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

const stockHealth = [
  {
    name: 'Vegetables',
    percentage: 85,
    status: 'healthy',
  },
  {
    name: 'Grains & Legumes',
    percentage: 45,
    status: 'warning',
  },
  {
    name: 'Dairy Products',
    percentage: 92,
    status: 'healthy',
  },
  {
    name: 'Oils & Condiments',
    percentage: 18,
    status: 'critical',
  },
  {
    name: 'Preserved Foods',
    percentage: 68,
    status: 'healthy',
  },
];

const upcomingHarvests = [
  {
    name: 'Strawberries',
    yield: '8 lbs',
    date: '2025-11-15',
    status: '1 day overdue',
    type: 'overdue',
    canHarvest: true,
  },
  {
    name: 'Blueberries',
    yield: '12 lbs',
    date: '2025-11-16',
    status: 'Due today',
    type: 'today',
    canHarvest: true,
  },
  {
    name: 'Tomatoes',
    yield: '25 lbs',
    date: '2025-11-19',
    status: '3 days',
    type: 'upcoming',
    canHarvest: false,
  },
  {
    name: 'Lettuce',
    yield: '15 lbs',
    date: '2025-11-21',
    status: '5 days',
    type: 'upcoming',
    canHarvest: false,
  },
  {
    name: 'Carrots',
    yield: '40 lbs',
    date: '2025-11-26',
    status: '10 days',
    type: 'upcoming',
    canHarvest: false,
  },
];

const KIDashboard = () => {
  return (
    <div className={styles.container}>
      {/* =========================
          Existing Dashboard Header
          ========================= */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Real-time overview of kitchen operations</p>
        </div>

        <button type="button" className={styles.priorityButton}>
          <span className={styles.bellIcon} aria-hidden="true">
            ♧
          </span>

          <span>Priority Ingredients</span>

          <span className={styles.priorityBadge}>9</span>
        </button>
      </header>

      {/* =========================
          Existing Alerts
          ========================= */}
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

      {/* =========================
          Existing Metrics
          ========================= */}
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

      {/* =========================
          Phase 6:
          Sustainability + Stock Health
          ========================= */}
      <section className={styles.overviewGrid}>
        {/* Sustainability Score */}
        <article className={styles.overviewCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>
                <span className={styles.greenIcon} aria-hidden="true">
                  ♧
                </span>
                Sustainability Score
              </h2>

              <p className={styles.cardSubtitle}>
                Percentage of ingredients grown onsite vs. purchased
              </p>
            </div>
          </div>

          <div className={styles.sustainabilityTopRow}>
            <span className={styles.sustainabilityScore}>64%</span>

            <span className={styles.excellentBadge}>Excellent</span>
          </div>

          <div className={styles.chartSection}>
            <div
              className={styles.pieChart}
              role="img"
              aria-label="Sustainability score: 36 percent onsite grown and 64 percent purchased"
            />

            <div className={styles.chartLabels}>
              <span className={styles.onsiteLabel}>Onsite Grown: 36%</span>

              <span className={styles.purchasedLabel}>Purchased: 64%</span>
            </div>

            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span
                  className={`${styles.legendSquare} ${styles.onsiteLegend}`}
                  aria-hidden="true"
                />
                <span>Onsite Grown</span>
              </div>

              <div className={styles.legendItem}>
                <span
                  className={`${styles.legendSquare} ${styles.purchasedLegend}`}
                  aria-hidden="true"
                />
                <span>Purchased</span>
              </div>
            </div>
          </div>

          <div className={styles.sustainabilityStats}>
            <div>
              <span className={styles.statLabel}>Onsite Grown</span>
              <strong className={styles.statValue}>89 items</strong>
            </div>

            <div>
              <span className={styles.statLabel}>Purchased</span>
              <strong className={styles.statValue}>158 items</strong>
            </div>
          </div>
        </article>

        {/* Stock Health Overview */}
        <article className={styles.overviewCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>
                <span className={styles.blueIcon} aria-hidden="true">
                  ↗
                </span>
                Stock Health Overview
              </h2>

              <p className={styles.cardSubtitle}>Current inventory levels by category</p>
            </div>
          </div>

          <div className={styles.stockList}>
            {stockHealth.map(item => (
              <div className={styles.stockItem} key={item.name}>
                <div className={styles.stockItemHeader}>
                  <span className={styles.stockName}>{item.name}</span>

                  <div className={styles.stockPercentage}>
                    <span>{item.percentage}%</span>

                    <span
                      className={`${styles.stockStatusIcon} ${styles[item.status]}`}
                      aria-label={`${item.status} stock`}
                    >
                      {item.status === 'healthy' && '✓'}
                      {item.status === 'warning' && '△'}
                      {item.status === 'critical' && '!'}
                    </span>
                  </div>
                </div>

                <div className={styles.stockBar}>
                  <div
                    className={`${styles.stockBarFill} ${styles[item.status]}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* =========================
          Phase 6:
          Upcoming Harvests
          ========================= */}
      <section className={styles.harvestSection}>
        <div className={styles.harvestHeader}>
          <div>
            <h2 className={styles.cardTitle}>
              <span className={styles.harvestIcon} aria-hidden="true">
                ▣
              </span>
              Upcoming Harvests
            </h2>

            <p className={styles.cardSubtitle}>Scheduled harvest timeline for onsite produce</p>
          </div>
        </div>

        <div className={styles.harvestList}>
          {upcomingHarvests.map(harvest => (
            <div className={`${styles.harvestItem} ${styles[harvest.type]}`} key={harvest.name}>
              <div className={styles.harvestLeft}>
                <div className={styles.harvestProduceIcon} aria-hidden="true">
                  ♧
                </div>

                <div className={styles.harvestInfo}>
                  <strong>{harvest.name}</strong>

                  <span>Expected yield: {harvest.yield}</span>
                </div>
              </div>

              <div className={styles.harvestRight}>
                <div className={styles.harvestDateInfo}>
                  <span className={styles.harvestDate}>{harvest.date}</span>

                  <span className={`${styles.harvestStatus} ${styles[harvest.type]}`}>
                    {harvest.status}
                  </span>
                </div>

                {harvest.canHarvest && (
                  <button type="button" className={styles.harvestButton}>
                    ✓ Harvest
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default KIDashboard;
