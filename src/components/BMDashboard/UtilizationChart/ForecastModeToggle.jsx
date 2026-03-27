import { useRef } from 'react';
import { FORECAST_MODE_LABELS } from './constants';
import styles from './UtilizationChart.module.css';

const MODES = Object.entries(FORECAST_MODE_LABELS);

function ForecastModeToggle({ value, onChange }) {
  const buttonRefs = useRef([]);

  const handleKeyDown = (e, index) => {
    const count = MODES.length;
    let nextIndex = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % count;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + count) % count;
    }

    if (nextIndex !== -1) {
      onChange(MODES[nextIndex][0]);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={styles.forecastToggle} role="radiogroup" aria-label="Forecast mode">
      {MODES.map(([mode, label], index) => (
        <button
          key={mode}
          ref={el => {
            buttonRefs.current[index] = el;
          }}
          type="button"
          role="radio"
          aria-checked={value === mode}
          tabIndex={value === mode ? 0 : -1}
          className={`${styles.toggleButton} ${value === mode ? styles.toggleButtonActive : ''}`}
          onClick={() => onChange(mode)}
          onKeyDown={e => handleKeyDown(e, index)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default ForecastModeToggle;
