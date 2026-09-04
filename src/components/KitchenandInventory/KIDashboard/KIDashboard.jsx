import React from 'react';
import styles from './KIDashboard.module.css';

const metrics = [
  {
    title: 'Total Ingredients',
    value: 128,
    info: '+12 this week',
    icon: '🥕',
  },
  {
    title: 'Onsite Grown',
    value: 46,
    info: '36% of total',
    icon: '🌱',
  },
  {
    title: 'Upcoming Meals',
    value: 8,
    info: 'Next 7 days',
    icon: '🍽️',
  },
  {
    title: 'Pending Orders',
    value: 5,
    info: '$1,247 total',
    icon: '📦',
  },
];

const lowStockItems = [
  {
    name: 'Tomatoes',
    current: '4 kg',
    minimum: '10 kg',
  },
  {
    name: 'Spinach',
    current: '2 kg',
    minimum: '8 kg',
  },
  {
    name: 'Carrots',
    current: '3 kg',
    minimum: '7 kg',
  },
];

const upcomingHarvests = [
  {
    name: 'Tomatoes',
    location: 'Garden A',
    date: 'Sep 8',
  },
  {
    name: 'Carrots',
    location: 'Garden B',
    date: 'Sep 12',
  },
];

const KIDashboard = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Kitchen & Inventory Dashboard</h1>

      {/* Low Stock Alerts */}
      <section className={styles.alertSection}>
        <h2>Low Stock Alerts</h2>

        <div className={styles.alertList}>
          {lowStockItems.map(item => (
            <div className={styles.alertCard} key={item.name}>
              <div className={styles.alertIcon}>⚠️</div>

              <div className={styles.alertContent}>
                <h3>{item.name}</h3>
                <p>
                  {item.current} remaining · Minimum {item.minimum}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Harvests */}
      <section className={styles.alertSection}>
        <h2>Upcoming Harvests</h2>

        <div className={styles.harvestList}>
          {upcomingHarvests.map(harvest => (
            <div className={styles.harvestCard} key={`${harvest.name}-${harvest.date}`}>
              <div className={styles.harvestIcon}>🌱</div>

              <div>
                <h3>{harvest.name}</h3>
                <p>
                  {harvest.location} · {harvest.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics */}
      <section className={styles.metricsGrid}>
        {metrics.map(metric => (
          <div className={styles.metricCard} key={metric.title}>
            <div className={styles.metricHeader}>
              <span aria-hidden="true">{metric.icon}</span>
              <h2>{metric.title}</h2>
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
