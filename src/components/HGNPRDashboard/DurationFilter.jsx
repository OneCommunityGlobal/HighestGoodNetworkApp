import './DurationFilter.module.css';
import { useTheme } from './ThemeContext';

function DurationFilter({ options, value, onChange }) {
  const { darkMode } = useTheme();
  const labelColor = darkMode ? '#f8fafc' : '#052C65';
  return (
    <div className="duration-filter">
      <label
        htmlFor="duration-select"
        className="duration-filter-label"
        style={{ color: labelColor }}
      >
        Duration:
      </label>
      <select
        id="duration-select"
        className="duration-filter-select"
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
      <div className="duration-filter-icon">▼</div>
    </div>
  );
}

export default DurationFilter;
