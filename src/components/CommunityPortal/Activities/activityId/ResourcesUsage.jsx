import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './ResourcesUsage.module.css';

function ResourcesUsage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const data = [
    {
      sNo: 1,
      name: 'Harsh Kadyan',
      materials: '????',
      facilities: 'Software Engineer Team',
      status: { text: 'Debited', color: 'green' },
      dueDate: '23 April 2025',
    },
    {
      sNo: 2,
      name: 'John Doe',
      materials: '????',
      facilities: 'HR Facilities',
      status: { text: 'Partially Debited', color: 'yellow' },
      dueDate: '12 May 2025',
    },
    {
      sNo: 3,
      name: 'Jane Smith',
      materials: '????',
      facilities: 'IT Equipment',
      status: { text: 'Not Debited', color: 'red' },
      dueDate: '15 March 2025',
    },
    {
      sNo: 4,
      name: 'Alex Brown',
      materials: '????',
      facilities: 'Admin Facilities',
      status: { text: 'Debited', color: 'green' },
      dueDate: '20 April 2025',
    },
  ];

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.resourcesUsage}`}>
        <h2 className={`${styles.resourceTitle}`}>Resource Usage Monitoring</h2>
        <div className={`${styles.resourceRow}`}>
          <div className={`${styles.column}`}>S.No</div>
          <div className={`${styles.column}`}>Name</div>
          <div className={`${styles.column}`}>Materials</div>
          <div className={`${styles.column}`}>Facilities</div>
          <div className={`${styles.column}`}>Status</div>
          <div className={`${styles.column}`}>Due Date</div>
          <div className={`${styles.column}`}>Actions</div>
        </div>
        {data.map(row => (
          <div key={row.sNo} className={`${styles.resourceRow}`}>
            <div className={`${styles.column}`}>{row.sNo}</div>
            <div className={`${styles.column}`}>{row.name}</div>
            <div className={`${styles.column}`}>{row.materials}</div>
            <div className={`${styles.column}`}>{row.facilities}</div>
            <div className={`${styles.column} ${styles[`status${row.status.color}`]}`}>
              {row.status.text}
            </div>
            <div className={`${styles.column}`}>{row.dueDate}</div>
            <div className={`${styles.column} ${styles.actionColumn}`}>
              <button type="button" className={`${styles.viewDetailsButton}`}>
                View Details
              </button>
            </div>
          </div>
        ))}
        <div className={`${styles.tickBox}`}>
          <label className={`${styles.tickLabel}`}>
            <input type="checkbox" id="tickAll" /> Tick off All Selected Items
          </label>
        </div>
      </div>
    </div>
  );
}

export default ResourcesUsage;
