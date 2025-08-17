import React, { useState } from 'react';
import styles from './FinancialCard.module.css';

const getColorScheme = percentage => {
  if (percentage === '-') return 'neutral';
  if (percentage > 0) return 'positive';
  if (percentage < 0) return 'negative';
  return 'neutral';
};

export default function FinancialCard({ title, value, monthOverMonth, additionalInfo = {} }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const colorScheme = getColorScheme(monthOverMonth);
  const titleClass = title.replace(/\s+/g, '-').toLowerCase();

  return (
    <div
      className={`${styles.financialCard} ${styles[`financialCardBackground${titleClass}`] || ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={styles.financialCardTitle}>{title}</div>

      <div
        className={`
        ${styles.financialCardEllipse} 
        ${styles[`financialCardEllipse${titleClass}`] || ''}`}
      />

      <div className={styles.financialCardValue}>
        {value === '-' ? '-' : value.toLocaleString()}
      </div>

      <div className={`${styles.financialCardMonthOverMonth} ${styles[colorScheme] || ''}`}>
        {monthOverMonth === '-'
          ? '-'
          : `${monthOverMonth > 0 ? '+' : ''}${monthOverMonth}% month over month`}
      </div>

      {showTooltip && Object.keys(additionalInfo).length > 0 && (
        <div className={styles.financialCardTooltip}>
          {Object.entries(additionalInfo).map(([key, val]) => (
            <div key={key} className={styles.financialCardTooltipItem}>
              <span className={styles.tooltipKey}>{key}:</span>
              <span className={styles.tooltipValue}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
