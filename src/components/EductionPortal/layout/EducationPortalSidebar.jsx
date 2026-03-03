import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '~/actions/authActions';
import { useSidebar } from '../SidebarContext';
import styles from './EducationPortalSidebar.module.css';

function isEducatorRole(role) {
  return role === 'Administrator' || role === 'Owner' || role === 'Manager';
}

export default function EducationPortalSidebar({ mobileOpen, onRequestClose }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const authUser = useSelector(state => state.auth?.user);
  const role = authUser?.role;
  const { isMinimized, setIsMinimized } = useSidebar();

  const canSeeEducator = isEducatorRole(role);

  const menu = useMemo(() => {
    const base = [
      { label: 'Home', icon: '🏠', to: '/educationportal' },
      { label: 'Lesson Library', icon: '📚', to: '/educationportal/lesson-library' },
      { label: 'Insight Widget', icon: '💡', to: '/educationportal/InsightWidget' },
    ];

    const student = [
      { label: 'Student Dashboard', icon: '📈', to: '/educationportal/dashboard' },
      { label: 'Student Tasks', icon: '📋', to: '/educationportal/student/tasks' },
      { label: 'Evaluation Results', icon: '🏆', to: '/educationportal/evaluation-results' },
    ];

    const educator = [
      { label: 'Educator Reports', icon: '📊', to: '/educationportal/reports' },
      { label: 'Groups', icon: '👥', to: '/educationportal/groups' },
      { label: 'Assign Atoms', icon: '🧬', to: '/educationportal/assignAtoms' },
      { label: 'Upload Task', icon: '📤', to: '/educationportal/tasks/upload' },
      { label: 'Intermediate Tasks', icon: '🧱', to: '/educationportal/tasks/intermediate' },
      { label: 'Report Download', icon: '📥', to: '/educationportal/reportButton' },
    ];

    if (canSeeEducator) return [...base, ...educator, ...student];
    return [...base, ...student];
  }, [canSeeEducator]);

  const onLogout = () => {
    const sessionStorageData = JSON.parse(window.sessionStorage.getItem('viewingUser'));
    if (sessionStorageData) {
      sessionStorage.removeItem('viewingUser');
      window.dispatchEvent(new Event('storage'));
    }
    dispatch(logoutUser());
    history.push('/login');
  };

  const isMobile =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(max-width: 960px)').matches
      : false;

  const sidebarClassName = [
    styles.sidebar,
    isMinimized ? styles.minimized : '',
    isMobile ? styles.mobile : '',
    mobileOpen ? styles.mobileOpen : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Close navigation"
          onClick={onRequestClose}
        />
      )}

      <aside className={sidebarClassName} aria-label="Education Portal navigation">
        <div className={styles.brandRow}>
          <div className={styles.brandMark} aria-hidden="true">
            GE
          </div>
          {!isMinimized && (
            <div className={styles.brandText}>
              <div className={styles.brandName}>Good Education</div>
              <div className={styles.brandSub}>
                {authUser?.firstName ? `Welcome, ${authUser.firstName}` : 'Welcome'}
              </div>
            </div>
          )}

          <button
            type="button"
            className={styles.collapseButton}
            aria-label={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? '»' : '«'}
          </button>
        </div>

        <nav className={styles.nav} aria-label="Primary">
          {menu.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              exact={item.to === '/educationportal'}
              className={styles.link}
              activeClassName={styles.active}
              onClick={() => {
                if (mobileOpen) onRequestClose();
              }}
              aria-current={location.pathname === item.to ? 'page' : undefined}
              title={isMinimized ? item.label : undefined}
            >
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.logout}
            onClick={onLogout}
            title={isMinimized ? 'Logout' : undefined}
          >
            <span className={styles.icon} aria-hidden="true">
              🚪
            </span>
            <span className={styles.label}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

EducationPortalSidebar.propTypes = {
  mobileOpen: PropTypes.bool,
  onRequestClose: PropTypes.func,
};

EducationPortalSidebar.defaultProps = {
  mobileOpen: false,
  onRequestClose: () => {},
};
