import React from 'react';
import styles from './OrchardManagement.module.css';

const orchardItems = [
  {
    id: 1,
    name: 'Apple Tree (Honeycrisp)',
    location: 'Row 1, Position 3',
    plantedDate: '2022-04-15',
    condition: 'excellent',
  },
  {
    id: 2,
    name: 'Pear Tree (Bartlett)',
    location: 'Row 1, Position 5',
    plantedDate: '2022-04-15',
    condition: 'good',
  },
  {
    id: 3,
    name: 'Cherry Tree (Bing)',
    location: 'Row 2, Position 2',
    plantedDate: '2021-03-20',
    condition: 'excellent',
  },
  {
    id: 4,
    name: 'Blueberry Bush',
    location: 'Berry Section A',
    plantedDate: '2023-05-10',
    condition: 'good',
  },
  {
    id: 5,
    name: 'Raspberry Bush',
    location: 'Berry Section B',
    plantedDate: '2023-05-10',
    condition: 'excellent',
  },
];

const summaryCards = [
  { title: 'Total Trees & Bushes', value: 5 },
  { title: 'Pending Orders', value: 2 },
  { title: 'Trimming Tasks', value: 4 },
  { title: 'Expected Harvests', value: 6 },
];

function calculateAgeInYears(plantedDate) {
  const planted = new Date(plantedDate);
  const today = new Date();
  const diffTime = today - planted;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const years = diffDays / 365.25;
  return `${years.toFixed(1)} years`;
}

function OrchardManagement() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Orchard Management</h1>
        <p className={styles.subtitle}>
          Manage fruit trees, bushes, and orchard maintenance schedules.
        </p>
      </div>

      <div className={styles.metricsGrid}>
        {summaryCards.map(card => (
          <div key={card.title} className={styles.metricCard}>
            <p className={styles.metricTitle}>{card.title}</p>
            <h2 className={styles.metricValue}>{card.value}</h2>
          </div>
        ))}
      </div>

      <div className={styles.sectionNav}>
        <button type="button" className={`${styles.navButton} ${styles.activeNav}`}>
          Trees & Bushes
        </button>
        <button type="button" className={styles.navButton}>
          Orders
        </button>
        <button type="button" className={styles.navButton}>
          Planting Schedule
        </button>
        <button type="button" className={styles.navButton}>
          Trimming Schedule
        </button>
        <button type="button" className={styles.navButton}>
          Harvest Calendar
        </button>
      </div>

      <div className={styles.inventorySection}>
        <div className={styles.inventoryHeader}>
          <div>
            <h3 className={styles.inventoryTitle}>Orchard Inventory</h3>
            <p className={styles.inventorySubtitle}>All trees and bushes in the orchard</p>
          </div>

          <button type="button" className={styles.addButton}>
            + Add Tree/Bush
          </button>
        </div>

        <div className={styles.cardGrid}>
          {orchardItems.map(item => (
            <div key={item.id} className={styles.orchardCard}>
              <div className={styles.cardTopRow}>
                <div>
                  <h4 className={styles.cardTitle}>{item.name}</h4>
                  <p className={styles.cardLocation}>{item.location}</p>
                </div>

                <span
                  className={`${styles.conditionTag} ${
                    item.condition === 'excellent' ? styles.excellent : styles.good
                  }`}
                >
                  {item.condition}
                </span>
              </div>

              <div className={styles.cardDetails}>
                <div>
                  <p className={styles.detailLabel}>Planted</p>
                  <p className={styles.detailValue}>{item.plantedDate}</p>
                </div>

                <div>
                  <p className={styles.detailLabel}>Age</p>
                  <p className={styles.detailValue}>{calculateAgeInYears(item.plantedDate)}</p>
                </div>
              </div>

              <button type="button" className={styles.detailsButton}>
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrchardManagement;
