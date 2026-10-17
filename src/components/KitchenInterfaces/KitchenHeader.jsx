import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './KitchenHeader.module.css';

const KitchenHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { name: 'Dashboard', path: '/kitchenandinventory' },
    { name: 'Production', path: '/kitchenandinventory/production', isDropdown: true },
    { name: 'Processing', path: '/kitchenandinventory/processing' },
    { name: 'Recipes', path: '/kitchenandinventory/recipes' },
    { name: 'Inventory', path: '/kitchenandinventory/inventory' },
    { name: 'Orders', path: '/kitchenandinventory/orders' },
    { name: 'Reports', path: '/kitchenandinventory/reports/preservation-efficiency' },
    { name: 'Food Bars', path: '/kitchenandinventory/foodbars' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className={styles.headerContainer}>
      <div className={styles.brandSection}>
        <div className={styles.logoTile}>
          <Leaf size={24} aria-hidden="true" />
        </div>
        <div className={styles.brandTextContainer}>
          <span className={styles.brandTitle}>Transition Kitchen</span>
          <span className={styles.brandSubtitle}>One Community Global</span>
        </div>
      </div>

      <button
        type="button"
        aria-expanded={isMenuOpen}
        className={styles.menuToggle}
        onClick={toggleMenu}
        aria-label="Toggle navigation"
      >
        <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
      </button>

      <nav className={`${styles.navContainer} ${isMenuOpen ? styles.navOpen : ''}`}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.name}
            exact={item.name === 'Dashboard'}
            to={item.path}
            className={styles.navItem}
            activeClassName={styles.activeLink}
            onClick={() => setIsMenuOpen(false)} // Close menu on click
          >
            {item.name}
            {item.isDropdown && <span className={styles.dropdownArrow}>▼</span>}
          </NavLink>
        ))}
      </nav>

      {/* Overlay for mobile when menu is open */}
      {isMenuOpen && (
        <button
          className={styles.overlay}
          onClick={() => setIsMenuOpen(false)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsMenuOpen(false);
            }
          }}
          tabIndex={0}
          aria-label="Close menu"
          type="button"
        />
      )}
    </header>
  );
};

export default KitchenHeader;
