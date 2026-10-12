import styles from './DurationFilter.module.css';

function DurationFilter({ options, value, onChange, darkMode = false }) {
  const dm = darkMode ? styles.dark : '';

  return (
    <div className={`${styles['duration-filter']} ${dm}`}>
      <label htmlFor="duration-select" className={`${styles['duration-filter-label']} ${dm}`}>
        Duration:
      </label>
      <select
        id="duration-select"
        className={`${styles['duration-filter-select']} ${dm}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label="Select duration filter"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className={`${styles['duration-filter-icon']} ${dm}`}>▼</div>
    </div>
  );
}

export default DurationFilter;
