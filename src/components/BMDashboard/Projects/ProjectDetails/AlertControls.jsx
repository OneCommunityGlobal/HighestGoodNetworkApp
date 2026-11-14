import { RISK_LABELS, RISK_LEVELS, SORT_OPTIONS } from './alertUtils';
import styles from './ProjectAlerts.module.css';

const BADGE_CLASS = {
  critical: styles.badgeCritical,
  warning: styles.badgeWarning,
  normal: styles.badgeNormal,
};

export function RiskBadge({ level, children }) {
  return (
    <span className={`${styles.badge} ${BADGE_CLASS[level] || ''}`}>
      {RISK_LABELS[level] || level}
      {children ? ` · ${children}` : ''}
    </span>
  );
}

// Sort and risk-level filter for one alert section. `idPrefix` keeps label/select
// ids unique when both sections are on the page.
export function AlertControls({ idPrefix, prefs, onChange, items }) {
  const counts = RISK_LEVELS.reduce(
    (acc, level) => ({ ...acc, [level]: items.filter(item => item.level === level).length }),
    {},
  );

  return (
    <>
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor={`${idPrefix}-sort`}>Sort by</label>
          <select
            id={`${idPrefix}-sort`}
            value={prefs.sortBy}
            onChange={e => onChange({ ...prefs, sortBy: e.target.value })}
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.controlGroup}>
          <label htmlFor={`${idPrefix}-level`}>Show</label>
          <select
            id={`${idPrefix}-level`}
            value={prefs.level}
            onChange={e => onChange({ ...prefs, level: e.target.value })}
          >
            <option value="all">All ({items.length})</option>
            {RISK_LEVELS.map(level => (
              <option key={level} value={level}>
                {RISK_LABELS[level]} ({counts[level]})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.summary} aria-live="polite">
        {RISK_LEVELS.filter(level => counts[level] > 0).map(level => (
          <RiskBadge key={level} level={level}>
            {counts[level]}
          </RiskBadge>
        ))}
      </div>
    </>
  );
}
