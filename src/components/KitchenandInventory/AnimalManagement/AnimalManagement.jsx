import React, { useState, useEffect } from 'react';
import styles from './AnimalManagement.module.css';

// --- Hook to detect dark mode from the app's theme ---
function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark =
        document.body.classList.contains('dark-mode') ||
        document.body.getAttribute('data-theme') === 'dark' ||
        document.documentElement.classList.contains('dark-mode') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDark);
    };

    checkDarkMode();

    // Watch for class changes on body (theme toggles)
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  return darkMode;
}

// --- Mock Data ---
const dashboardStats = [
  { id: 1, label: 'Total Animals', value: 148, icon: '🐄', color: 'green' },
  { id: 2, label: 'Pending Animal Orders', value: 12, icon: '📋', color: 'amber' },
  { id: 3, label: 'Feed Orders', value: 7, icon: '🌾', color: 'brown' },
  { id: 4, label: 'Upcoming Culling Tasks', value: 3, icon: '📅', color: 'red' },
];

const sectionTabs = [
  'Animal Inventory',
  'Animal Orders',
  'Feed Inventory',
  'Feed Orders',
  'Culling Events',
];

const animals = [
  {
    id: 1,
    name: 'Holstein Cows',
    type: 'Holstein Friesian',
    purpose: 'Dairy',
    count: 24,
    location: 'Barn A - North Pasture',
    age: '2–5 years',
    health: 'Healthy',
  },
  {
    id: 2,
    name: 'Leghorn Chickens',
    type: 'White Leghorn',
    purpose: 'Egg Laying',
    count: 60,
    location: 'Coop 1',
    age: '6–18 months',
    health: 'Healthy',
  },
  {
    id: 3,
    name: 'Boer Goats',
    type: 'Boer',
    purpose: 'Meat',
    count: 18,
    location: 'Pen B - South Field',
    age: '1–3 years',
    health: 'Attention',
  },
  {
    id: 4,
    name: 'Berkshire Pigs',
    type: 'Berkshire',
    purpose: 'Meat',
    count: 15,
    location: 'Sty 2',
    age: '8–14 months',
    health: 'Healthy',
  },
  {
    id: 5,
    name: 'Pekin Ducks',
    type: 'Pekin',
    purpose: 'Egg Laying / Meat',
    count: 20,
    location: 'Pond Enclosure',
    age: '4–12 months',
    health: 'Healthy',
  },
  {
    id: 6,
    name: 'Merino Sheep',
    type: 'Merino',
    purpose: 'Wool / Meat',
    count: 11,
    location: 'Barn B - East Pasture',
    age: '1–4 years',
    health: 'Critical',
  },
];

// --- Sub-components ---

function DashboardCard({ stat, darkMode }) {
  return (
    <div
      className={`${styles.dashboardCard} ${styles[`card_${stat.color}`]} ${
        darkMode ? styles.dark : ''
      }`}
    >
      <div className={styles.cardIcon}>{stat.icon}</div>
      <div className={styles.cardContent}>
        <span className={styles.cardValue}>{stat.value}</span>
        <span className={styles.cardLabel}>{stat.label}</span>
      </div>
    </div>
  );
}

function HealthTag({ status, darkMode }) {
  const statusClass = status.toLowerCase().replace(' ', '');
  return (
    <span
      className={`${styles.healthTag} ${styles[`health_${statusClass}`]} ${
        darkMode ? styles.dark : ''
      }`}
    >
      {status}
    </span>
  );
}

function AnimalCard({ animal, darkMode }) {
  return (
    <div className={`${styles.animalCard} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.animalCardHeader}>
        <h3 className={styles.animalName}>{animal.name}</h3>
        <HealthTag status={animal.health} darkMode={darkMode} />
      </div>
      <div className={styles.animalDetails}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>🔢 Count</span>
          <span className={styles.detailValue}>{animal.count}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>🎯 Purpose</span>
          <span className={styles.detailValue}>{animal.purpose}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>🧬 Type / Breed</span>
          <span className={styles.detailValue}>{animal.type}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>📍 Location</span>
          <span className={styles.detailValue}>{animal.location}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>📅 Age</span>
          <span className={styles.detailValue}>{animal.age}</span>
        </div>
      </div>
      <button className={`${styles.viewDetailsBtn} ${darkMode ? styles.dark : ''}`} type="button">
        View Details
      </button>
    </div>
  );
}

function SectionNavbar({ activeSection, onSectionChange, darkMode }) {
  return (
    <nav className={`${styles.sectionNavbar} ${darkMode ? styles.dark : ''}`}>
      {sectionTabs.map(tab => (
        <button
          key={tab}
          type="button"
          className={`${styles.sectionTab} ${activeSection === tab ? styles.activeTab : ''} ${
            darkMode ? styles.dark : ''
          }`}
          onClick={() => onSectionChange(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}

function SearchAndFilter({ searchTerm, onSearchChange, darkMode }) {
  return (
    <div className={`${styles.searchBar} ${darkMode ? styles.dark : ''}`}>
      <input
        type="text"
        placeholder="Search animals by name, breed, or location..."
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        className={`${styles.searchInput} ${darkMode ? styles.dark : ''}`}
        aria-label="Search animals"
      />
    </div>
  );
}

// --- Main Component ---

function AnimalManagement() {
  const darkMode = useDarkMode();
  const [activeSection, setActiveSection] = useState('Animal Inventory');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAnimals = animals.filter(animal => {
    const term = searchTerm.toLowerCase();
    return (
      animal.name.toLowerCase().includes(term) ||
      animal.type.toLowerCase().includes(term) ||
      animal.location.toLowerCase().includes(term) ||
      animal.purpose.toLowerCase().includes(term)
    );
  });

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ''}`}>
      {/* Page Header */}
      <header className={styles.pageHeader}>
        <h1 className={`${styles.pageTitle} ${darkMode ? styles.dark : ''}`}>
          🐾 Animal Management
        </h1>
        <p className={`${styles.pageSubtitle} ${darkMode ? styles.dark : ''}`}>
          Monitor animal inventory, orders, feed, and culling events.
        </p>
      </header>

      {/* Dashboard Cards */}
      <section className={styles.dashboardGrid} aria-label="Dashboard summary">
        {dashboardStats.map(stat => (
          <DashboardCard key={stat.id} stat={stat} darkMode={darkMode} />
        ))}
      </section>

      {/* Section Navbar */}
      <SectionNavbar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        darkMode={darkMode}
      />

      {/* Active Section Content */}
      {activeSection === 'Animal Inventory' && (
        <section aria-label="Animal Inventory">
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            darkMode={darkMode}
          />
          {filteredAnimals.length > 0 ? (
            <div className={styles.animalGrid}>
              {filteredAnimals.map(animal => (
                <AnimalCard key={animal.id} animal={animal} darkMode={darkMode} />
              ))}
            </div>
          ) : (
            <p className={`${styles.noResults} ${darkMode ? styles.dark : ''}`}>
              No animals match your search.
            </p>
          )}
        </section>
      )}

      {activeSection !== 'Animal Inventory' && (
        <div className={`${styles.placeholderSection} ${darkMode ? styles.dark : ''}`}>
          <p>{activeSection} section coming soon.</p>
        </div>
      )}
    </div>
  );
}

export default AnimalManagement;
