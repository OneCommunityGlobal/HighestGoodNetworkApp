import styles from './DurationFilter.module.css';

function DurationFilter({ options, value, onChange, darkMode = false }) {
  const labelColor = darkMode ? '#f8fafc' : '#052C65';
  const selectBg = darkMode ? '#2d3748' : '#ffffff';
  const selectBorder = darkMode ? '#4a5568' : '#d1d5db';
  const selectText = darkMode ? '#f8fafc' : '#052C65';

  return (
    <div className={styles['duration-filter']}>
      <label
        htmlFor="duration-select"
        className={styles['duration-filter-label']}
        style={{ color: labelColor }}
      >
        Duration:
      </label>
      <select
        id="duration-select"
        className={styles['duration-filter-select']}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label="Select duration filter"
        style={{
          backgroundColor: selectBg,
          borderColor: selectBorder,
          color: selectText,
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className={styles['duration-filter-icon']} style={{ color: selectText }}>
        ▼
      </div>
    </div>
  );
}

export default DurationFilter;
