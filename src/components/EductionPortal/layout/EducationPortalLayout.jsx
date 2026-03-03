import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useSidebar } from '../SidebarContext';
import EducationPortalSidebar from './EducationPortalSidebar';
import styles from './EducationPortalLayout.module.css';

export default function EducationPortalLayout({ children }) {
  const location = useLocation();
  const { isMinimized } = useSidebar();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const closeMobileNav = () => setIsMobileNavOpen(false);

  const routeKey = useMemo(() => location.pathname, [location.pathname]);

  return (
    <div className={styles.shell} data-minimized={isMinimized ? 'true' : 'false'}>
      <EducationPortalSidebar
        key={routeKey}
        mobileOpen={isMobileNavOpen}
        onRequestClose={closeMobileNav}
      />

      <div className={styles.main}>
        <button
          type="button"
          className={styles.mobileMenuButton}
          aria-label="Open navigation"
          onClick={() => setIsMobileNavOpen(true)}
        >
          <span className={styles.mobileMenuIcon} aria-hidden="true">
            <Menu size={14} />
          </span>
          Menu
        </button>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

EducationPortalLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
