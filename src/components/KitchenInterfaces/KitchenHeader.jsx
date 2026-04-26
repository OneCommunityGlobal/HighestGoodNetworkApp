import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import styles from './KitchenHeader.module.css';

const KitchenHeader = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { name: 'Dashboard', path: '/kitchenandinventory/dashboard' },
    { name: 'Production', path: '/kitchenandinventory/production', isDropdown: true },
    { name: 'Processing', path: '/kitchenandinventory/processing' },
    { name: 'Recipes', path: '/kitchenandinventory/recipes' },
    { name: 'Inventory', path: '/kitchenandinventory/inventory' },
    { name: 'Orders', path: '/kitchenandinventory/orders' },
    { name: 'Reports', path: '/kitchenandinventory/reports' },
    { name: 'Food Bars', path: '/kitchenandinventory/foodbars' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className={`${styles.headerContainer} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.brandSection}>
        <div className={styles.brandTextContainer}>
          <span className={styles.brandTitle}>Transition Kitchen</span>
          <span className={styles.brandSubtitle}>One Community Global</span>
        </div>
      </div>

      <button className={styles.menuToggle} onClick={toggleMenu} aria-label="Toggle navigation">
        <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
      </button>

      <nav className={`${styles.navContainer} ${isMenuOpen ? styles.navOpen : ''}`}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={styles.navItem}
            activeClassName={styles.activeLink}
            onClick={() => setIsMenuOpen(false)} // Close menu on click
            isActive={match => {
              if (!match) return false;
              return true;
            }}
          >
            {item.name}
            {item.isDropdown && <span className={styles.dropdownArrow}>▼</span>}
          </NavLink>
        ))}
      </nav>

      {/* Overlay for mobile when menu is open */}
      {isMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMenuOpen(false)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsMenuOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}
    </header>
  );
};

export default KitchenHeader;
