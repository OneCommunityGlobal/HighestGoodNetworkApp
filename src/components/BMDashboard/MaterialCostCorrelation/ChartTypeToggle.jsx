import { FaChartBar, FaChartLine } from 'react-icons/fa';
import styles from './ChartTypeToggle.module.css';

function ChartTypeToggle({ currentChartType, onToggle, darkMode }) {
  return (
    <div className={`${styles.toggleContainer} ${darkMode ? styles.darkMode : ''}`}>
      <button
        type="button"
        onClick={() => onToggle('scatter')}
        className={`${styles.toggleButton} ${currentChartType === 'scatter' ? styles.active : ''} ${
          darkMode ? styles.darkMode : ''
        }`}
        aria-pressed={currentChartType === 'scatter'}
      >
        <FaChartLine className={styles.toggleIcon} />
        <span>Scatter Plot</span>
      </button>
      <button
        type="button"
        onClick={() => onToggle('bar')}
        className={`${styles.toggleButton} ${currentChartType === 'bar' ? styles.active : ''} ${
          darkMode ? styles.darkMode : ''
        }`}
        aria-pressed={currentChartType === 'bar'}
      >
        <FaChartBar className={styles.toggleIcon} />
        <span>Bar Chart</span>
      </button>
    </div>
  );
}

export default ChartTypeToggle;
