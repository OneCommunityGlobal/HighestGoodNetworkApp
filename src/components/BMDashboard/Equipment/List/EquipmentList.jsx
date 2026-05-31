import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaCubes, FaShoppingCart, FaRecycle, FaWrench, FaTools } from 'react-icons/fa';
import useTheme from '../../../../hooks/useTheme';
import EquipmentsTable from './EquipmentsTable';
import EquipmentsInputs from './EquipmentsInputs';
import styles from './Equipments.module.css';

const siblingCategories = [
  { label: 'Materials', route: '/bmdashboard/materials', icon: <FaCubes /> },
  { label: 'Consumables', route: '/bmdashboard/consumables', icon: <FaShoppingCart /> },
  { label: 'Reusables', route: '/bmdashboard/reusables', icon: <FaRecycle /> },
  { label: 'Tools', route: '/bmdashboard/tools', icon: <FaWrench /> },
];

function EquipmentList() {
  const [equipment, setEquipment] = useState({ label: 'All Equipments', value: '0' });
  const [project, setProject] = useState({ label: 'All Projects', value: '0' });
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
          <div className={styles.inventoryNav}>
            <Link to="/bmdashboard/inventorytypes" className={styles.returnBtn}>
              ← All Inventory Types
            </Link>
            <div className={styles.categoryIcons}>
              {siblingCategories.map(cat => (
                <Link
                  key={cat.label}
                  to={cat.route}
                  className={styles.categoryIconLink}
                  title={cat.label}
                >
                  <span className={styles.iconWrapper}>{cat.icon}</span>
                </Link>
              ))}
            </div>
          </div>

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
