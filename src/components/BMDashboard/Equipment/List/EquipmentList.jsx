import { useState } from 'react';
import useTheme from '../../../../hooks/useTheme';
import EquipmentsTable from './EquipmentsTable';
import EquipmentsInputs from './EquipmentsInputs';
import styles from './Equipments.module.css';
import { Link } from 'react-router-dom';

function EquipmentList() {
  const [equipment, setEquipment] = useState({ label: 'All Equipments', value: '0' });
  const [project, setProject] = useState({ label: 'All Projects', value: '0' });

  // Use the custom hook to handle dark mode
  useTheme();

  return (
    <>
      <Link to="/bmdashboard/inventorytypes" className={styles.backLink}>
        All Inventory Types
      </Link>
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
    </>
  );
}

export default EquipmentList;
