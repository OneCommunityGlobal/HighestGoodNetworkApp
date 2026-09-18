import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const location = useLocation();
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const authUser = useSelector(state => state.auth.user);

  const menuItems = [
    {
      icon: '🏠',
      label: 'Education Portal',
      path: '/educationportal',
      isActive: location.pathname === '/educationportal',
    },
    {
      icon: '📊',
      label: 'Reports',
      path: '/educator/reports',
      isActive: location.pathname === '/educator/reports',
    },
    {
      icon: '👥',
      label: 'Groups',
      path: '/educator/groups',
      isActive: location.pathname === '/educator/groups',
    },
  ];

  return (
    <div className={`${styles.sidebar} ${darkMode ? styles.darkMode : ''}`}>
      {/* User Welcome Section */}
      <div className={styles.userSection}>
        <div className={styles.welcomeIcon}>👋</div>
        <div className={styles.welcomeText}>
          <span className={styles.welcomeLabel}>Welcome,</span>
          <span className={styles.userName}>{authUser?.firstName || 'Educator'}</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={styles.navigation}>
        <ul className={styles.menuList}>
          {menuItems.map(item => (
            <li key={item.path} className={styles.menuItem}>
              <NavLink
                to={item.path}
                className={`${styles.menuLink} ${item.isActive ? styles.active : ''}`}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuLabel}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
