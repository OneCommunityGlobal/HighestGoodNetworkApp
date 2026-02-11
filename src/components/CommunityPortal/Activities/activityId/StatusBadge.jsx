import { useSelector } from 'react-redux';
import styles from './StatusBadge.module.css';

export default function StatusBadge({ status }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  if (!status) return null;

  return (
    <span
      className={`${styles.badge} ${styles[status.toLowerCase()]} ${
        darkMode ? styles.bgOxfordBlue : ''
      }`}
    >
      {status}
    </span>
  );
}
