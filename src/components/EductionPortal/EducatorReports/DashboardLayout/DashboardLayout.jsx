import React from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../Sidebar/Sidebar';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ children }) => {
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  return (
    <div className={`${styles.dashboardLayout} ${darkMode ? styles.darkMode : ''}`}>
      <Sidebar />
      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
