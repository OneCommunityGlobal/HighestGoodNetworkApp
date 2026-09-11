import React from 'react';
import { useSelector } from 'react-redux';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ children }) => {
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.dashboardLayout} `}>
        <div className={`${styles.mainContent}`}>
          <div className={`${styles.contentWrapper}`}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
