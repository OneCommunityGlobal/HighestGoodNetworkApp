import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './EducationPortalSidebar.module.css';

function isEducatorRole(role) {
  return role === 'Administrator' || role === 'Owner' || role === 'Manager';
}

export default function EducationPortalSidebar({ mobileOpen, onRequestClose }) {
  const history = useHistory();
  const location = useLocation();
  const authUser = useSelector(state => state.auth?.user);
  const role = authUser?.role;
  const darkMode = useSelector(state => state.theme.darkMode);
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
    try {
      const sessionStorageData = JSON.parse(window.sessionStorage.getItem('viewingUser'));
      if (sessionStorageData) {
        sessionStorage.removeItem('viewingUser');
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {}

    sessionStorage.setItem('gePortalLoggedOut', 'true');
    if (mobileOpen) onRequestClose();
    history.push('/dashboard');
  };

  const sidebarClassName = [styles.sidebar, mobileOpen ? styles.mobileOpen : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      {mobileOpen && (
        <button
          type="button"
          className={`${styles.overlay}`}
          aria-label="Close navigation"
          onClick={onRequestClose}
        />
      )}

      <aside
        id="ep-sidebar"
        className={`${sidebarClassName}`}
        aria-label="Education Portal navigation"
      >
        <div className={`${styles.brandRow}`}>
          <div className={`${styles.brandMark}`} aria-hidden="true">
            GE
          </div>
          <div className={`${styles.brandText}`}>
            <div className={`${styles.brandName}`}>Good Education</div>
            <div className={`${styles.brandSub}`}>
              {authUser?.firstName ? `Welcome, ${authUser.firstName}` : 'Welcome'}
            </div>
          </div>
        </div>

        <nav className={`${styles.nav}`} aria-label="Primary">
          {menu.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              exact={item.to === '/educationportal'}
              className={`${styles.link}`}
              activeClassName={`${styles.active}`}
              onClick={() => {
                if (mobileOpen) onRequestClose();
              }}
              aria-current={location.pathname === item.to ? 'page' : undefined}
            >
              <span className={`${styles.icon}`} aria-hidden="true">
                {item.icon}
              </span>
              <span className={`${styles.label}`}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={`${styles.footer}`}>
          <button type="button" className={`${styles.logout}`} onClick={onLogout}>
            <span className={`${styles.icon}`} aria-hidden="true">
              🚪
            </span>
            <span className={`${styles.label}`}>Logout</span>
          </button>
        </div>
      </aside>
    </div>
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
