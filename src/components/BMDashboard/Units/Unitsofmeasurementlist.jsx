import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaCubes,
  FaShoppingCart,
  FaTools,
  FaRecycle,
  FaWrench,
  FaRulerCombined,
} from 'react-icons/fa';
import UnitsTable from '../InventoryTypesList/invUnitsTable';
import styles from '../InventoryTypesList/TypesList.module.css';

const siblingCategories = [
  { label: 'Materials', route: '/bmdashboard/materials', icon: <FaCubes /> },
  { label: 'Consumables', route: '/bmdashboard/consumables', icon: <FaShoppingCart /> },
  { label: 'Equipment', route: '/bmdashboard/equipment', icon: <FaTools /> },
  { label: 'Reusables', route: '/bmdashboard/reusables', icon: <FaRecycle /> },
  { label: 'Tools', route: '/bmdashboard/tools', icon: <FaWrench /> },
];

function UnitsOfMeasurementList() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={`${styles.typesListContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h1>
        <span className={styles.categoryIcon}>
          <FaRulerCombined />
        </span>
        Unit of Measurement
      </h1>

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

      <UnitsTable />
    </div>
  );
}

export default UnitsOfMeasurementList;
