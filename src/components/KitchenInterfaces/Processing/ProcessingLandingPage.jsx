import React, { useState } from 'react';
import styles from './ProcessingLandingPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArchive,
  faSun,
  faSnowflake,
  faWarehouse,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';

// Mock Data
const DASHBOARD_METRICS = [
  { id: 1, title: 'Items Canned', value: 245, icon: faArchive, iconClass: styles.iconPurple },
  { id: 2, title: 'Items Dehydrated', value: 128, icon: faSun, iconClass: styles.iconOrange },
  { id: 3, title: 'Freeze Dried', value: 67, icon: faSnowflake, iconClass: styles.iconBlue },
  { id: 4, title: 'Cellar Storage', value: 180, icon: faWarehouse, iconClass: styles.iconGreen },
];

const PROCESSING_METHODS = [
  { id: 'canning', name: 'Canning', total: 245, thisMonth: 45, status: 'active' },
  { id: 'dehydration', name: 'Dehydration', total: 128, thisMonth: 28, status: 'active' },
  { id: 'freezeDrying', name: 'Freeze Drying', total: 67, thisMonth: 12, status: 'active' },
  { id: 'cellarStorage', name: 'Cellar Storage', total: 180, thisMonth: 52, status: 'active' },
];

const CANNING_SUPPLIES = [
  { name: 'Quart Jars', quantity: '120 units' },
  { name: 'Pint Jars', quantity: '85 units' },
  { name: 'Canning Lids', quantity: '200 units' },
];

const STORAGE_SUPPLIES = [
  { name: 'Vacuum Seal Bags (Quart)', quantity: '45 units' },
  { name: 'Mylar Bags (Gallon)', quantity: '38 units' },
  { name: 'Cellar Storage Bins', quantity: '12 units' },
];

const SECTIONS = [
  'Processing Overview',
  'Canning',
  'Dehydration',
  'Freeze Drying',
  'Cellar Storage',
  'Bulk Orders',
  'Menu Calendar',
];

const ProcessingLandingPage = () => {
  const [activeTab, setActiveTab] = useState('Processing Overview');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Kitchen & Processing</h1>
        <p className={styles.subtitle}>
          Manage food processing, preservation, bulk orders, and menu planning
        </p>
      </div>

      <div className={styles.cardsContainer}>
        {DASHBOARD_METRICS.map(metric => (
          <div key={metric.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{metric.title}</span>
              <FontAwesomeIcon
                icon={metric.icon}
                className={`${styles.cardIcon} ${metric.iconClass}`}
              />
            </div>
            <p className={styles.cardValue}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className={styles.navbar}>
        {SECTIONS.map(section => (
          <button
            key={section}
            className={`${styles.navItem} ${activeTab === section ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab(section)}
          >
            {section}
          </button>
        ))}
      </div>

      {activeTab === 'Processing Overview' ? (
        <div className={styles.overviewContainer}>
          {/* Left Column: Processing Methods */}
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Processing Methods</h2>
              <p className={styles.sectionSubtitle}>Items processed by method</p>
            </div>

            <div className={styles.methodList}>
              {PROCESSING_METHODS.map(method => (
                <div key={method.id} className={styles.methodItem}>
                  <div className={styles.methodInfo}>
                    <span className={styles.methodName}>{method.name}</span>
                    <span className={styles.methodSub}>+{method.thisMonth} this month</span>
                  </div>
                  <div className={styles.methodStats}>
                    <span className={styles.methodValue}>{method.total}</span>
                    <span className={styles.methodStatus}>{method.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Processing Supplies */}
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Processing Supplies</h2>
              <p className={styles.sectionSubtitle}>Current inventory of processing materials</p>
            </div>

            <div className={styles.suppliesList}>
              <div className={styles.supplyCategory}>
                <h3 className={styles.categoryTitle}>Canning Supplies</h3>
                {CANNING_SUPPLIES.map((item, idx) => (
                  <div key={idx} className={styles.supplyItem}>
                    <span className={styles.supplyName}>{item.name}</span>
                    <span className={styles.supplyQuantity}>{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className={styles.supplyCategory}>
                <h3 className={styles.categoryTitle}>Storage Materials</h3>
                {STORAGE_SUPPLIES.map((item, idx) => (
                  <div key={idx} className={styles.supplyItem}>
                    <span className={styles.supplyName}>{item.name}</span>
                    <span className={styles.supplyQuantity}>{item.quantity}</span>
                  </div>
                ))}
              </div>

              <button className={styles.addSupplyBtn}>
                <FontAwesomeIcon icon={faPlus} />
                Add Supply Item
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.placeholderContainer}>
          <div className={styles.placeholderContent}>
            <FontAwesomeIcon icon={faArchive} className={styles.placeholderIcon} />
            <h2>{activeTab} Section</h2>
            <p>This module is currently under development.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingLandingPage;
