import React, { useState } from 'react';
import styles from './KIDashboard.module.css';

// These are temporary frontend values.
// They can be replaced with API data when the backend is ready.
const TOTAL_INGREDIENTS = 247;
const ONSITE_GROWN = 89;
const UPCOMING_MEALS = 25;
const PENDING_ORDERS = 3;
const PENDING_ORDER_VALUE = 1247;

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

// Creates sample harvest dates relative to the current date.
// Replace these sample entries with backend data later.
const getInitialHarvests = () => {
  const today = new Date();

  const getDateAfterDays = days => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  return [
    {
      id: 'strawberries',
      name: 'Strawberries',
      yield: '8 lbs',
      date: getDateAfterDays(-1),
    },
    {
      id: 'blueberries',
      name: 'Blueberries',
      yield: '12 lbs',
      date: getDateAfterDays(0),
    },
    {
      id: 'tomatoes',
      name: 'Tomatoes',
      yield: '25 lbs',
      date: getDateAfterDays(3),
    },
    {
      id: 'lettuce',
      name: 'Lettuce',
      yield: '15 lbs',
      date: getDateAfterDays(5),
    },
    {
      id: 'carrots',
      name: 'Carrots',
      yield: '40 lbs',
      date: getDateAfterDays(10),
    },
  ];
};

// Compares calendar dates without time-of-day or timezone issues.
const getDaysUntil = dateString => {
  const [year, month, day] = dateString.split('-').map(Number);
  const harvestDate = Date.UTC(year, month - 1, day);

  const today = new Date();
  const todayDate = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.round((harvestDate - todayDate) / (1000 * 60 * 60 * 24));
};

const getHarvestDetails = date => {
  const daysUntil = getDaysUntil(date);

  if (daysUntil < 0) {
    const overdueDays = Math.abs(daysUntil);

    return {
      status: `${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} overdue`,
      type: 'overdue',
      canHarvest: true,
    };
  }

  if (daysUntil === 0) {
    return {
      status: 'Due today',
      type: 'today',
      canHarvest: true,
    };
  }

  return {
    status: `${daysUntil} ${daysUntil === 1 ? 'day' : 'days'} remaining`,
    type: 'upcoming',
    canHarvest: false,
  };
};

const formatDate = dateString => {
  const [year, month, day] = dateString.split('-').map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const KIDashboard = () => {
  const [harvests, setHarvests] = useState(getInitialHarvests);

  const purchasedIngredients = TOTAL_INGREDIENTS - ONSITE_GROWN;

  const onsitePercentage = Math.round((ONSITE_GROWN / TOTAL_INGREDIENTS) * 100);

  const purchasedPercentage = 100 - onsitePercentage;

  const priorityItems = stockHealth.filter(
    item => item.status === 'warning' || item.status === 'critical',
  );

  const nextHarvest = [...harvests].sort((a, b) => a.date.localeCompare(b.date))[0];

  const handleHarvest = harvestId => {
    setHarvests(currentHarvests => currentHarvests.filter(harvest => harvest.id !== harvestId));
  };

  const metrics = [
    {
      title: 'Total Ingredients',
      value: TOTAL_INGREDIENTS,
      info: 'Current inventory',
      icon: '◈',
      iconClass: 'blue',
    },
    {
      title: 'Onsite Grown',
      value: ONSITE_GROWN,
      info: `${onsitePercentage}% of total ingredients`,
      icon: '♧',
      iconClass: 'green',
    },
    {
      title: 'Upcoming Meals',
      value: UPCOMING_MEALS,
      info: 'Scheduled meals',
      icon: '▣',
      iconClass: 'purple',
    },
    {
      title: 'Pending Orders',
      value: PENDING_ORDERS,
      info: `$${PENDING_ORDER_VALUE.toLocaleString()} total`,
      icon: '🛒',
      iconClass: 'orange',
    },
  ];

  return (
    <div className={styles.container}>
      {/* Dashboard Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Overview of kitchen and inventory activity</p>
        </div>

        <button
          type="button"
          className={styles.priorityButton}
          onClick={() => {
            document.getElementById('low-stock-alert')?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }}
        >
          <span className={styles.bellIcon} aria-hidden="true">
            !
          </span>

          <span>Priority Ingredients</span>

          <span className={styles.priorityBadge}>{priorityItems.length}</span>
        </button>
      </header>

      {/* Alerts */}
      <section className={styles.alerts}>
        {priorityItems.length > 0 && (
          <div id="low-stock-alert" className={`${styles.alertBanner} ${styles.lowStockAlert}`}>
            <div className={styles.alertBannerIcon}>!</div>

            <div className={styles.alertBannerContent}>
              <h2>Low Stock Alert</h2>
              <p>{priorityItems.map(item => item.name).join(', ')} need attention.</p>
            </div>
          </div>
        )}

        {nextHarvest && (
          <div className={`${styles.alertBanner} ${styles.harvestAlert}`}>
            <div className={styles.alertBannerIcon}>□</div>

            <div className={styles.alertBannerContent}>
              <h2>Harvest Upcoming</h2>
              <p>
                {nextHarvest.name} - {getHarvestDetails(nextHarvest.date).status}. Expected yield:{' '}
                {nextHarvest.yield}.
              </p>
            </div>
          </div>
        )}

        <div className={`${styles.alertBanner} ${styles.seasonalAlert}`}>
          <div className={styles.alertBannerIcon}>⌁</div>

          <div className={styles.alertBannerContent}>
            <h2>Seasonal Recommendation</h2>
            <p>Review available onsite produce when planning upcoming meals.</p>
          </div>
        </div>
      </section>

      {/* Dashboard Metrics */}
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

      {/* Sustainability and Stock Health */}
      <section className={styles.overviewGrid}>
        {/* Sustainability */}
        <article className={styles.overviewCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>
                <span className={styles.greenIcon} aria-hidden="true">
                  ♧
                </span>
                Sustainability Score
              </h2>

              <p className={styles.cardSubtitle}>Share of ingredients grown onsite</p>
            </div>
          </div>

          <div className={styles.sustainabilityTopRow}>
            <span className={styles.sustainabilityScore}>{onsitePercentage}%</span>

            <span className={styles.excellentBadge}>Onsite share</span>
          </div>

          <div className={styles.chartSection}>
            <div
              className={styles.pieChart}
              role="img"
              aria-label={`${onsitePercentage}% onsite grown and ${purchasedPercentage}% purchased`}
              style={{
                background: `conic-gradient(
                  #2e9d68 0% ${onsitePercentage}%,
                  #e8a94b ${onsitePercentage}% 100%
                )`,
              }}
            />

            <div className={styles.chartLabels}>
              <span className={styles.onsiteLabel}>Onsite Grown: {onsitePercentage}%</span>

              <span className={styles.purchasedLabel}>Purchased: {purchasedPercentage}%</span>
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
              <strong className={styles.statValue}>{ONSITE_GROWN} items</strong>
            </div>

            <div>
              <span className={styles.statLabel}>Purchased</span>
              <strong className={styles.statValue}>{purchasedIngredients} items</strong>
            </div>
          </div>
        </article>

        {/* Stock Health */}
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

      {/* Upcoming Harvests */}
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
          {harvests.length > 0 ? (
            harvests.map(harvest => {
              const harvestDetails = getHarvestDetails(harvest.date);

              return (
                <div
                  className={`${styles.harvestItem} ${styles[harvestDetails.type]}`}
                  key={harvest.id}
                >
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
                      <span className={styles.harvestDate}>{formatDate(harvest.date)}</span>

                      <span className={`${styles.harvestStatus} ${styles[harvestDetails.type]}`}>
                        {harvestDetails.status}
                      </span>
                    </div>

                    {harvestDetails.canHarvest && (
                      <button
                        type="button"
                        className={styles.harvestButton}
                        onClick={() => handleHarvest(harvest.id)}
                        aria-label={`Mark ${harvest.name} as harvested`}
                      >
                        ✓ Harvest
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className={styles.cardSubtitle}>
              All harvests have been completed. No upcoming harvests.
            </p>
          )}
        </div>
      </section>
import FoodCategoriesPieChart from './FoodCategoriesPieChart/FoodCategoriesPieChart';

export function KIDashboard() {
  return (
    <div>
      <h1>Welcome to Kitchen and Inventory Dashboard</h1>
      <FoodCategoriesPieChart />
    </div>
  );
};

export default KIDashboard;
