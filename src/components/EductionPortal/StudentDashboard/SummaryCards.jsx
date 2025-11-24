import React from 'react';
import styles from './SummaryCards.module.css';

const SummaryCards = ({ data }) => {
  const cards = [
    {
      title: 'Total Time Logged',
      value: data.totalTimeLogged,
      description: 'Across all courses',
      icon: 'clock',
    },
    {
      title: 'This Week',
      value: data.totalTimeLogged, // Using same value as total for demo
      description: `${data.logEntries} log entries`,
      icon: 'calendar',
    },
    {
      title: 'Active Courses',
      value: data.activeCourses.toString(),
      description: 'Currently enrolled',
      icon: 'book',
    },
  ];

  const getIcon = iconName => {
    const iconProps = {
      width: 24,
      height: 24,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
    };

    switch (iconName) {
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
      case 'book':
        return (
          <svg {...iconProps}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.summaryCards}>
      {cards.map((card, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>{getIcon(card.icon)}</div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
            </div>
            <div className={styles.cardValue}>{card.value}</div>
            <p className={styles.cardDescription}>{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
