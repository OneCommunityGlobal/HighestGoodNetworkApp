import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { readSessionPrefs, writeSessionPrefs } from './alertUtils';
import { RiskBadge } from './AlertControls';
import styles from './ProjectAlerts.module.css';

// Sort/filter preferences that last for the browser session.
export function useSessionPrefs(key, fallback) {
  const [prefs, setPrefs] = useState(() => readSessionPrefs(key, fallback));
  const update = useCallback(
    next => {
      setPrefs(next);
      writeSessionPrefs(key, next);
    },
    [key],
  );
  return [prefs, update];
}

// One alert item. The title is a real link (or button) whose clickable area
// is stretched over the whole card with CSS, so clicking anywhere on the card
// opens the detail view while keyboard and screen reader users get a normal
// control. The action buttons sit above that layer.
export function AlertCard({ item, title, imageUrl, detailPath, onOpen, badgeText, meta, actions }) {
  return (
    <li
      className={`${styles.card} ${styles[item.level] || ''}`}
      data-testid={`alert-card-${item.id}`}
    >
      {imageUrl && <img className={styles.cardImage} src={imageUrl} alt="" />}
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            {detailPath ? (
              <Link to={detailPath} className={styles.stretchedLink}>
                {title}
              </Link>
            ) : (
              <button
                type="button"
                className={`btn btn-link p-0 text-reset ${styles.stretchedLink}`}
                onClick={onOpen}
              >
                {title}
              </button>
            )}
          </h3>
          <RiskBadge level={item.level}>{badgeText}</RiskBadge>
        </div>
        <dl className={styles.cardMeta}>
          {meta
            .filter(([, value]) => value != null && value !== '')
            .map(([label, value]) => (
              <div key={label} style={{ display: 'contents' }}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </li>
  );
}
