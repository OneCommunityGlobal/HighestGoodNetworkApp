import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSidebar } from '../SidebarContext';
import styles from './SideBar.module.css';

const SideBar = () => {
  const location = useLocation();
  const authUser = useSelector(state => state.auth?.user);
  const { isMinimized, setIsMinimized } = useSidebar();

  const menuItems = [
    { icon: '🏠', label: 'Homepage', path: '/educationportal' },
    { icon: '📊', label: 'Knowledge Evaluation', path: '#' },
    { icon: '📋', label: 'Past Lesson Plans', path: '#' },
    { icon: '⭐', label: 'My Saved Interests', path: '#' },
    { icon: '📈', label: 'Evaluation results', path: '/educationportal/evaluation-results' },
    { icon: '🏗️', label: 'Build Lesson Plan', path: '#' },
  ];

  const isActive = path => path !== '#' && location.pathname === path;

  return (
    <aside className={`${styles.sidebar} ${isMinimized ? styles.minimized : ''}`}>
      {/* User Welcome Section */}
      <div className={styles.userSection}>
        <div className={styles.welcomeIcon}>👋</div>
        {!isMinimized && (
          <>
            <div className={styles.welcomeText}>
              <div className={styles.welcomeLabel}>Welcome</div>
              <div className={styles.userName}>{authUser?.firstName || 'Student'}</div>
            </div>
            <div className={styles.notifyIcon}>🔔</div>
          </>
        )}
        {isMinimized && (
          <button
            className={styles.toggleButton}
            onClick={() => setIsMinimized(!isMinimized)}
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            ➜
          </button>
        )}
      </div>

      {/* Toggle Button - Only show when expanded */}
      {!isMinimized && (
        <div className={styles.toggleButtonContainer}>
          <button
            className={styles.minimizeBtn}
            onClick={() => setIsMinimized(!isMinimized)}
            title="Minimize sidebar"
            aria-label="Minimize sidebar"
          >
            ⬅️
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {menuItems.map(item => (
            <li key={item.label} className={styles.menuItem}>
              {item.path !== '#' ? (
                <NavLink
                  to={item.path}
                  className={`${styles.menuLink} ${isActive(item.path) ? styles.active : ''}`}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  <span className={styles.label}>{item.label}</span>
                </NavLink>
              ) : (
                <div className={styles.menuLink}>
                  <span className={styles.icon}>{item.icon}</span>
                  <span className={styles.label}>{item.label}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;
