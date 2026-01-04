import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import EquipmentsTable from './EquipmentsTable';
import EquipmentsInputs from './EquipmentsInputs';
import styles from './Equipments.module.css';

function EquipmentList() {
  const [equipment, setEquipment] = useState({ label: 'All Equipments', value: '0' });
  const [project, setProject] = useState({ label: 'All Projects', value: '0' });

  // Get dark mode from Redux
  const darkMode = useSelector(state => state.theme.darkMode);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.add('bm-dashboard-dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.remove('bm-dashboard-dark');
    }

    return () => {
      document.body.classList.remove('dark-mode');
      document.body.classList.remove('bm-dashboard-dark');
    };
  }, [darkMode]);

  return (
    <div className={`${styles.PageViewContainer}`}>
      <div className={`${styles.Page}`}>
        <div className={`${styles.Box}`}>
          <div className={`${styles.BuildingTitle}`}>EQUIPMENTS</div>
          <EquipmentsInputs
            equipment={equipment}
            setEquipment={setEquipment}
            project={project}
            setProject={setProject}
          />
          <EquipmentsTable
            equipment={equipment}
            setEquipment={setEquipment}
            project={project}
            setProject={setProject}
          />
        </div>
      </div>
    </div>
  );
}

export default EquipmentList;
