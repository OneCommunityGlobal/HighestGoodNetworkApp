import React, { useState } from 'react';
import styles from './OrchardManagement.module.css';
import { GiFruitTree } from 'react-icons/gi';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { PiScissorsLight, PiLeafLight } from 'react-icons/pi';

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
  { title: 'Total Trees & Bushes', value: 5, icon: GiFruitTree, iconClass: styles.greenIcon },
  { title: 'Pending Orders', value: 2, icon: HiOutlineShoppingCart, iconClass: styles.blueIcon },
  { title: 'Trimming Tasks', value: 4, icon: PiScissorsLight, iconClass: styles.purpleIcon },
  { title: 'Expected Harvests', value: 6, icon: PiLeafLight, iconClass: styles.orangeIcon },
];

const sectionTabs = [
  'Trees & Bushes',
  'Orders',
  'Planting Schedule',
  'Trimming Schedule',
  'Harvest Schedule',
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
  const [activeSection, setActiveSection] = useState('Trees & Bushes');
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Orchard Management</h1>
        <p className={styles.subtitle}>
          Manage fruit trees, bushes, and orchard maintenance schedules.
        </p>
      </div>

      <div className={styles.metricsGrid}>
        {summaryCards.map(card => {
          const Icon = card.icon;

          return (
            <div key={card.title} className={styles.metricCard}>
              <div className={styles.metricCardTop}>
                <p className={styles.metricTitle}>{card.title}</p>
                <Icon className={`${styles.metricIcon} ${card.iconClass}`} />
              </div>
              <h2 className={styles.metricValue}>{card.value}</h2>
            </div>
          );
        })}
      </div>

      <div className={styles.sectionNav}>
        {sectionTabs.map(tab => (
          <button
            key={tab}
            type="button"
            className={`${styles.navButton} ${activeSection === tab ? styles.activeNav : ''}`}
            onClick={() => setActiveSection(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeSection === 'Trees & Bushes' ? (
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
                  <div className={styles.cardHeaderLeft}>
                    <div className={styles.iconWrapper}>
                      <GiFruitTree className={styles.treeIcon} />
                    </div>

                    <div>
                      <h4 className={styles.cardTitle}>{item.name}</h4>
                      <p className={styles.cardLocation}>{item.location}</p>
                    </div>
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
      ) : (
        <div className={styles.placeholderSection}>
          <h3 className={styles.placeholderTitle}>{activeSection}</h3>
        </div>
      )}
    </div>
  );
}

export default OrchardManagement;
