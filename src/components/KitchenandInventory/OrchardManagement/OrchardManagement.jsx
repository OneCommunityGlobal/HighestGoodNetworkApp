import React from 'react';
import styles from './OrchardManagement.module.css';

function OrchardManagement() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Orchard Management</h1>
        <p className={styles.subtitle}>
          Manage fruit trees, bushes, and orchard maintenance schedules.
        </p>
      </div>
    </div>
  );
}

export default OrchardManagement;
