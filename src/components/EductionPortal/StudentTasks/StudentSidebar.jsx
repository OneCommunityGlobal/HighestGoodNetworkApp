import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styles from './StudentSidebar.module.css';

function Icon({ name }) {
  const commonProps = { 'aria-hidden': 'true', focusable: 'false' };
  const icons = {
    menu: (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path
          d="M3 6h18M3 12h18M3 18h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    home: (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path
          d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path
          d="M4 20V6m6 14V10m6 10V4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    folder: (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path
          d="M3 6h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
      </svg>
    ),
    star: (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path
          d="m12 3 2.9 5.9 6.5.9-4.7 4.5 1.1 6.5L12 17.8 6.2 20.8l1.1-6.5L2.6 9.8l6.5-.9z"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path
          d="M7 3v3m10-3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1z"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
    pencil: (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path
          d="M3 21l3.8-1 11-11a2.2 2.2 0 0 0-3.1-3.1L3.7 16.9 3 21z"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>
    ),
    cog: (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path
          d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm8 4a7.9 7.9 0 0 0-.1-1l2-1.6-1.9-3.3-2.4 1a8 8 0 0 0-1.7-1l-.3-2.6H10.4l-.3 2.6a8 8 0 0 0-1.7 1l-2.4-1-1.9 3.3 2 1.6a8 8 0 0 0 0 2l-2 1.6 1.9 3.3 2.4-1a8 8 0 0 0 1.7 1l.3 2.6h3.6l.3-2.6a8 8 0 0 0 1.7-1l2.4 1 1.9-3.3-2-1.6c.1-.3.1-.7.1-1Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24" {...commonProps}>
        <path
          d="M9 8V4a2 2 0 0 1 2-2h8v20h-8a2 2 0 0 1-2-2v-4M5 12h10M12 9l3 3-3 3"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };
  return <span className={styles.icon}>{icons[name] || null}</span>;
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
};

export default function Sidebar({ active, onLogout }) {
  const darkMode = useSelector(state => state.theme?.darkMode);
  const safeLogout = onLogout || (() => {});

  return (
    <aside
      className={`${styles.sidebar} ${darkMode ? styles.sidebarDark : ''}`}
      aria-label="Section navigation"
    >
      <button className={styles.hamburger} type="button" aria-label="Open menu">
        <Icon name="menu" />
      </button>

      <nav className={styles.nav} aria-label="Primary">
        {['home', 'chart', 'folder', 'star', 'calendar', 'pencil'].map(icon => (
          <button
            key={icon}
            className={`${styles.navItem} ${active === icon ? styles.active : ''}`}
            type="button"
            aria-label={icon}
          >
            <Icon name={icon} />
          </button>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button className={styles.bottomIcon} type="button" aria-label="Settings">
          <Icon name="cog" />
        </button>
        <button
          className={styles.bottomIcon}
          type="button"
          onClick={safeLogout}
          aria-label="Log out"
        >
          <Icon name="logout" />
        </button>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  active: PropTypes.string,
  onLogout: PropTypes.func,
};

Sidebar.defaultProps = {
  active: 'home',
  onLogout: undefined,
};
