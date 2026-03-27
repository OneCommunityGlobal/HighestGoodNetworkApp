import { FORECAST_MODE_LABELS } from './constants';
import styles from './UtilizationChart.module.css';

function ForecastModeToggle({ value, onChange, darkMode }) {
  return (
    <div
      className={`${styles.forecastToggle} ${darkMode ? styles.darkMode : ''}`}
      role="radiogroup"
      aria-label="Forecast mode"
    >
      {Object.entries(FORECAST_MODE_LABELS).map(([mode, label]) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value === mode}
          className={`${styles.toggleButton} ${value === mode ? styles.toggleButtonActive : ''}`}
          onClick={() => onChange(mode)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default ForecastModeToggle;
