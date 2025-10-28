import styles from '../EventManagementPage.module.css';

export default function Tabs({ tabs = [], active, activeKey, onChange }) {
  const current = active ?? activeKey;
  return (
    <div className={styles.tabRow}>
      {tabs.map(t => {
        // support both string tabs and { key, label } shape
        const key = typeof t === 'string' ? t : t.key;
        const label = typeof t === 'string' ? t : t.label;
        const isActive = key === current;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
