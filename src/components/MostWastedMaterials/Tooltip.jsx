// Custom Tooltip Component
import styles from './Tooltip.module.css';

export default function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className={`${styles.tooltipWrapper}`}>
        <p className={`${styles.tooltipLabel}`}>{label}</p>
        <p className={`${styles.tooltipValue}`}>Waste: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
}
