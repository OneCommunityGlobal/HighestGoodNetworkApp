import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import hasPermission from '../../utils/permissions';
import { permissions } from '../../utils/permissionKeys';
import styles from './LBNavHeader.module.css';

const PRIVILEGED_ROLES = new Set(['Owner', 'Administrator', 'Core Team']);

const NAV_ITEMS = [
  { to: '/lbdashboard', label: 'Dashboard', exact: true },
  { to: '/lbdashboard/listOverview', label: 'Listing Overview' },
  { to: '/lbdashboard/bidding', label: 'Bidding' },
];

export function useCanSeeLBHeader() {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  // Re-evaluate when roles load
  useSelector(state => state.role.roles);
  if (!auth?.isAuthenticated) return false;
  return (
    PRIVILEGED_ROLES.has(auth.user?.role) ||
    !!dispatch(hasPermission(permissions.listingAndBiddingAdvancedAccess))
  );
}

export function LBNavHeader() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const canSee = useCanSeeLBHeader();
  if (!canSee) return null;
  return (
    <nav
      aria-label="Listing and Bidding navigation"
      className={`${styles.header} ${darkMode ? styles.dark : ''}`}
    >
      {NAV_ITEMS.map(({ to, label, exact }) => (
        <NavLink
          key={to}
          to={to}
          exact={exact}
          className={styles.link}
          activeClassName={styles.active}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function LBBackButton() {
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <NavLink to="/lbdashboard" className={`${styles.back} ${darkMode ? styles.dark : ''}`}>
      &larr; Back to Listing &amp; Bidding Dashboard
    </NavLink>
  );
}

export default LBNavHeader;
