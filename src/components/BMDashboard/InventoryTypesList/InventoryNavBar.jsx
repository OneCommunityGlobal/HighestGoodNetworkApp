import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Shared navigation bar used across all BM Dashboard inventory category pages
 * (Materials, Consumables, Equipment, Reusables, Tools, Units).
 * Renders a "back to All Inventory Types" link plus icon links to sibling categories.
 */
function InventoryNavBar({ categories, styles }) {
  return (
    <div className={styles.inventoryNav}>
      <Link to="/bmdashboard/inventorytypes" className={styles.returnBtn}>
        ← All Inventory Types
      </Link>
      <div className={styles.categoryIcons}>
        {categories.map(cat => (
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
  );
}

InventoryNavBar.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      route: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
    }),
  ).isRequired,
  styles: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default InventoryNavBar;
