import React from 'react';
import styles from './Sidebar.module.css';

function Icon({ name }) {
  // simple inline SVGs so we don’t pull extra libs
  const icons = {
    menu: (
      <svg viewBox="0 0 24 24">
        <path
          d="M3 6h18M3 12h18M3 18h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    home: (
      <svg viewBox="0 0 24 24">
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
      <svg viewBox="0 0 24 24">
        <path
          d="M4 20V6m6 14V10m6 10V4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    folder: (
      <svg viewBox="0 0 24 24">
        <path
          d="M3 6h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
      </svg>
    ),
    star: (
      <svg viewBox="0 0 24 24">
        <path
          d="m12 3 2.9 5.9 6.5.9-4.7 4.5 1.1 6.5L12 17.8 6.2 20.8l1.1-6.5L2.6 9.8l6.5-.9z"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24">
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
      <svg viewBox="0 0 24 24">
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
      <svg viewBox="0 0 24 24">
        <path
          d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm8 4a7.9 7.9 0 0 0-.1-1l2-1.6-1.9-3.3-2.4 1a8 8 0 0 0-1.7-1l-.3-2.6H10.4l-.3 2.6a8 8 0 0 0-1.7 1l-2.4-1-1.9 3.3 2 1.6a8 8 0 0 0 0 2l-2 1.6 1.9 3.3 2.4-1a8 8 0 0 0 1.7 1l.3 2.6h3.6l.3-2.6a8 8 0 0 0 1.7-1l2.4 1 1.9-3.3-2-1.6c.1-.3.1-.7.1-1Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24">
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
  return <span className={styles.icon}>{icons[name]}</span>;
}

export default function Sidebar({ active = 'home', onLogout }) {
  return (
    <aside className={styles.sidebar} aria-label="Section navigation">
      <button className={styles.hamburger} aria-label="Open menu">
        <Icon name="menu" />
      </button>

      <nav className={styles.nav}>
        {[
          { id: 'home', icon: 'home' },
          { id: 'chart', icon: 'chart' },
          { id: 'folder', icon: 'folder' },
          { id: 'star', icon: 'star' },
          { id: 'calendar', icon: 'calendar' },
          { id: 'pencil', icon: 'pencil' },
        ].map(item => (
          <button
            key={item.id}
            className={`${styles.navItem} ${active === item.id ? styles.active : ''}`}
            aria-current={active === item.id ? 'page' : undefined}
          >
            <Icon name={item.icon} />
          </button>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button className={styles.bottomItem}>
          <Icon name="cog" />
          <span>Settings</span>
        </button>
        <button className={styles.bottomItem} onClick={onLogout}>
          <Icon name="logout" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
