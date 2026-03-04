import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import EducationPortalSidebar from './EducationPortalSidebar';
import styles from './EducationPortalLayout.module.css';

export default function EducationPortalLayout({ children }) {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const closeMobileNav = () => setIsMobileNavOpen(false);

  const routeKey = useMemo(() => location.pathname, [location.pathname]);

  const headerTitle = useMemo(() => {
    // Keep this simple and consistent across EP pages.
    return 'Education Portal';
  }, []);

  return (
    <div className={styles.shell}>
      <EducationPortalSidebar
        key={routeKey}
        mobileOpen={isMobileNavOpen}
        onRequestClose={closeMobileNav}
      />

      <div className={styles.main}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.mobileMenuButton}
            aria-label="Open navigation"
            aria-controls="ep-sidebar"
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen(true)}
          >
            <span className={styles.mobileMenuIcon} aria-hidden="true">
              <Menu size={16} />
            </span>
            <span className={styles.mobileMenuLabel}>Menu</span>
          </button>

          <div className={styles.headerTitle} aria-label="Section title">
            {headerTitle}
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

EducationPortalLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
