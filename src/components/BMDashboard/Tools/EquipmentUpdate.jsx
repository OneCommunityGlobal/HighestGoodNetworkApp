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
          <h2>Which Tool or Equipment to Update</h2>
        </header>
        <EquipmentUpdateForm />
      </main>
    </div>
  );
}
