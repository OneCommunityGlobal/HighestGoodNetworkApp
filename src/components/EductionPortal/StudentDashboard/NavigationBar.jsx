import React, { useState } from 'react';
import styles from './NavigationBar.module.css';

const NavigationBar = ({ darkMode = false }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = dropdown => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const navigationItems = [
    { name: 'Home', icon: 'home', hasDropdown: false },
    { name: 'Clock', icon: 'clock', hasDropdown: true },
    { name: 'Calendar View', icon: 'calendar', hasDropdown: false },
    { name: 'Announcements', icon: 'megaphone', hasDropdown: true },
    { name: 'Notifications', icon: 'bell', hasDropdown: true },
    { name: 'Profile', icon: 'person', hasDropdown: true },
    { name: 'Settings', icon: 'settings', hasDropdown: true },
  ];

  const getIcon = iconName => {
    const iconProps = {
      width: 20,
      height: 20,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
    };

    switch (iconName) {
      case 'home':
        return (
          <svg {...iconProps}>
            <path d="M3 11.5 12 3l9 8.5" />
            <path d="M5 12.5v7a1.5 1.5 0 0 0 1.5 1.5H10v-6h4v6h3.5A1.5 1.5 0 0 0 19 19.5v-7" />
          </svg>
        );
      case 'clock':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        );
      case 'calendar':
        return (
          <svg {...iconProps}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M7 3v4M17 3v4M3 9h18" />
          </svg>
        );
      case 'megaphone':
        return (
          <svg {...iconProps}>
            <path d="M3 11l19-5-19-5v10z" />
            <path d="M5.5 6.5v11" />
            <path d="M8.5 8.5v7" />
            <path d="M11.5 9.5v5" />
          </svg>
        );
      case 'bell':
        return (
          <svg {...iconProps}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
      case 'person':
        return (
          <svg {...iconProps}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'settings':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav className={styles.navigationBar}>
      <div className={styles.navContainer}>
        {navigationItems.map((item, index) => (
          <div key={index} className={styles.navItem}>
            <button
              className={styles.navButton}
              onClick={() => item.hasDropdown && toggleDropdown(item.name)}
            >
              {getIcon(item.icon)}
              <span className={styles.navText}>{item.name}</span>
              {item.hasDropdown && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`${styles.dropdownArrow} ${
                    activeDropdown === item.name ? styles.rotated : ''
                  }`}
                >
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              )}
            </button>

            {item.hasDropdown && activeDropdown === item.name && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownContent}>
                  <button className={styles.dropdownItem}>Option 1</button>
                  <button className={styles.dropdownItem}>Option 2</button>
                  <button className={styles.dropdownItem}>Option 3</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default NavigationBar;
