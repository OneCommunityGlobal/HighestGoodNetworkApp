import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { readSessionPrefs, writeSessionPrefs } from './alertUtils';
import { RiskBadge } from './AlertControls';
import styles from './ProjectAlerts.module.css';

const INTERACTIVE = 'a, button, input, select, textarea, label';

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

// One alert item. Clicking anywhere on the card except its buttons and links
// runs `onOpen`; the title is a real link (or button) so keyboard and screen
// reader users reach the same detail view.
export function AlertCard({ item, title, imageUrl, detailPath, onOpen, badgeText, meta, actions }) {
  const handleCardClick = e => {
    if (e.target.closest(INTERACTIVE)) return;
    onOpen();
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <li
      className={`${styles.card} ${styles[item.level] || ''}`}
      onClick={handleCardClick}
      data-testid={`alert-card-${item.id}`}
    >
      {imageUrl && <img className={styles.cardImage} src={imageUrl} alt="" />}
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>
            {detailPath ? (
              <Link to={detailPath}>{title}</Link>
            ) : (
              <button type="button" className="btn btn-link p-0 text-reset" onClick={onOpen}>
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
