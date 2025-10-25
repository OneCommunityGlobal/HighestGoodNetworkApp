import styles from '../EventOrganizerPage.module.css';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className={styles.tabRow}>
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`${styles.tabBtn} ${t === active ? styles.tabBtnActive : ''}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
