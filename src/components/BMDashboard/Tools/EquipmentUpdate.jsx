import { useSelector } from 'react-redux';
import EquipmentUpdateForm from './EquipmentUpdateForm';
import styles from './EquipmentUpdate.module.css';

export default function EquipmentUpdate() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div
      className={`${styles.equipmentUpdateWrapper} ${darkMode ? 'bg-oxford-blue text-light' : ''}`}
    >
      <main className={styles.equipmentUpdateContainer}>
        <header className={styles.equipmentUpdateHeader}>
          <h2>Update Total Tool or Equipment Count</h2>
          <p className={styles.updateSubText}>
            Select the item below and enter the new total quantity to replace the current count.
          </p>
        </header>
        <EquipmentUpdateForm />
      </main>
    </div>
  );
}
