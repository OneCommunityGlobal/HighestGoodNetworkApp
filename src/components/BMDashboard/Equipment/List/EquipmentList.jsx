import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FaCubes,
  FaShoppingCart,
  FaRecycle,
  FaWrench,
  FaTools,
  FaRulerCombined,
} from 'react-icons/fa';
import useTheme from '../../../../hooks/useTheme';
import EquipmentsTable from './EquipmentsTable';
import EquipmentsInputs from './EquipmentsInputs';
import InventoryNavBar from '../../InventoryTypesList/InventoryNavBar';
import styles from './Equipments.module.css';

const siblingCategories = [
  { label: 'Materials', route: '/bmdashboard/materials', icon: <FaCubes /> },
  { label: 'Consumables', route: '/bmdashboard/consumables', icon: <FaShoppingCart /> },
  { label: 'Reusables', route: '/bmdashboard/reusables', icon: <FaRecycle /> },
  { label: 'Tools', route: '/bmdashboard/tools', icon: <FaWrench /> },
  { label: 'Units', route: '/bmdashboard/units', icon: <FaRulerCombined /> },
];

function EquipmentList() {
  const [equipment, setEquipment] = useState([]); // Array of strings
  const [project, setProject] = useState([]); // Array of strings
  const [localProjectValues, setLocalProjectValues] = useState([]);
  const [localEquipmentValues, setLocalEquipmentValues] = useState([]);
  const darkMode = useSelector(state => state.theme.darkMode);
  useTheme();

  return (
    <div className={`${styles.PageViewContainer}`}>
      <div className={`${styles.Page}`}>
        <div className={`${styles.Box}`}>
          <div className={`${styles.BuildingTitle} ${darkMode ? styles.darkTitle : ''}`}>
            <FaTools style={{ marginRight: '10px', verticalAlign: 'middle' }} />
            EQUIPMENT
          </div>
          {/* Inventory Navigation Bar */}
          <InventoryNavBar categories={siblingCategories} styles={styles} />
          <EquipmentsInputs
            equipment={equipment}
            setEquipment={setEquipment}
            project={project}
            setProject={setProject}
            localProjectValues={localProjectValues}
            setLocalProjectValues={setLocalProjectValues}
            localEquipmentValues={localEquipmentValues}
            setLocalEquipmentValues={setLocalEquipmentValues}
          />
          <EquipmentsTable equipment={equipment} project={project} />
        </div>
      </div>
    </div>
  );
}

export default EquipmentList;
