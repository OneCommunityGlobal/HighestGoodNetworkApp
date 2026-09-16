import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FaRulerCombined,
  FaCubes,
  FaShoppingCart,
  FaTools,
  FaRecycle,
  FaWrench,
} from 'react-icons/fa';
import { fetchInvUnits } from '../../../actions/bmdashboard/invUnitActions';
import InventoryNavBar from '../InventoryTypesList/InventoryNavBar';
import UnitsTable from '../InventoryTypesList/invUnitsTable';
import styles from '../ItemList/ItemListView.module.css';
import typesStyles from '../InventoryTypesList/TypesList.module.css';

const siblingCategories = [
  { label: 'Materials', route: '/bmdashboard/materials', icon: <FaCubes /> },
  { label: 'Consumables', route: '/bmdashboard/consumables', icon: <FaShoppingCart /> },
  { label: 'Equipment', route: '/bmdashboard/equipment', icon: <FaTools /> },
  { label: 'Reusables', route: '/bmdashboard/reusables', icon: <FaRecycle /> },
  { label: 'Tools', route: '/bmdashboard/tools', icon: <FaWrench /> },
];

function UnitsOfMeasurementList() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInvUnits());
  }, []);

  return (
    <main className={`${styles.itemsListContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h3 className={styles.pageTitle}>
        <span className={styles.pageTitleIcon}>
          <FaRulerCombined />
        </span>{' '}
        Unit of Measurement
      </h3>

      {/* Inventory Navigation Bar */}
      <InventoryNavBar categories={siblingCategories} styles={styles} />

      <div className={typesStyles.typesListContainer}>
        <UnitsTable />
      </div>
    </main>
  );
}

export default UnitsOfMeasurementList;
