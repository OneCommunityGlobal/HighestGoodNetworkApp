// Custom Tooltip Component
import styles from './Tooltip.module.css';
import { useSelector } from 'react-redux';
export default function CustomTooltip({ active, payload, label }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  if (active && payload && payload.length) {
    return (
      <div className={`${darkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.tooltipWrapper}`}>
          <p className={`${styles.tooltipLabel} ${styles.labelBlue}`}>{label}</p>
          <p className={`${styles.tooltipValue}`}>Waste: {payload[0].value}%</p>
        </div>
      </div>
    );
  }
  return null;
}
