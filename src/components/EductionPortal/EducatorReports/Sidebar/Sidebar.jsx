import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './Sidebar.module.css';
import { sidebarMenuItems, sidebarBottomMenuItems } from '../mockdata';

const Sidebar = () => {
  const location = useLocation();
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const authUser = useSelector(state => state.auth.user);

  const menuItems = sidebarMenuItems.map(item => ({
    ...item,
    isActive: location.pathname === item.path,
  }));

  const bottomMenuItems = sidebarBottomMenuItems;

  const handleLogout = () => {
    // Handle logout logic here
    // console.log('Logout clicked');
  };

  return (
    <div className={`${styles.sidebar} ${darkMode ? styles.darkMode : ''}`}>
      {/* User Welcome Section */}
      <div className={styles.userSection}>
        <div className={styles.welcomeIcon}>👋</div>
        <div className={styles.welcomeText}>
          <span className={styles.welcomeLabel}>Welcome,</span>
          <span className={styles.userName}>{authUser?.firstName || 'Student Name'}</span>
        </div>
        <div className={styles.notificationIcon}>🔔</div>
      </div>

      {/* Main Navigation */}
      <nav className={styles.navigation}>
        <ul className={styles.menuList}>
          {menuItems.map((item, index) => (
            <li key={index} className={styles.menuItem}>
              {item.path ? (
                <NavLink
                  to={item.path}
                  className={`${styles.menuLink} ${item.isActive ? styles.active : ''}`}
                >
                  <span className={styles.menuIcon}>{item.icon}</span>
                  <span className={styles.menuLabel}>{item.label}</span>
                </NavLink>
              ) : (
                <div className={styles.menuLink}>
                  <span className={styles.menuIcon}>{item.icon}</span>
                  <span className={styles.menuLabel}>{item.label}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Menu */}
      <div className={styles.bottomMenu}>
        <ul className={styles.menuList}>
          {bottomMenuItems.map((item, index) => (
            <li key={index} className={styles.menuItem}>
              {item.isLogout ? (
                <button
                  onClick={handleLogout}
                  className={`${styles.menuLink} ${styles.logoutButton}`}
                >
                  <span className={styles.menuIcon}>{item.icon}</span>
                  <span className={styles.menuLabel}>{item.label}</span>
                </button>
              ) : (
                <NavLink to={item.path} className={styles.menuLink}>
                  <span className={styles.menuIcon}>{item.icon}</span>
                  <span className={styles.menuLabel}>{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
