import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './ResourceManagement.module.css';
import { formatDateTimeLocal } from '../../utils/formatDate';

function SearchBar({ searchTerm, onSearchChange, onClear }) {
  return (
    <div className={styles.searchBarContainer}>
      <div className={styles.searchBarContainerLeft}>
        <span className={styles.iconAdd}>+</span>
        <span className={styles.iconLines}>=</span>
        <span className={styles.iconToggle}>⇅</span>
      </div>
      <div className={styles.searchBarContainerRight}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by User"
          value={searchTerm}
          onChange={onSearchChange}
        />
        {searchTerm && (
          <button type="button" className={styles.clearButton} onClick={onClear}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

function ResourceManagement() {
  const darkMode = useSelector(state => state.theme.darkMode);

  // Standard Date Format: '2026-01-30T18:00:00.000Z'

  // Standard Time/Duration Format: 'HH:mm:ss'

  const [resources] = useState([
    {
      id: 1,
      user: 'First Last',
      timeDuration: '02:30:00',
      facilities: 'Landing Page',
      materials: 'Meadow Lane Oakland',
      date: '2026-01-30T18:00:00.000Z',
    },
    {
      id: 2,
      user: 'Test Last',
      timeDuration: '02:20:00',
      facilities: 'CRM Admin pages',
      materials: 'Larry San Francisco',
      date: '2026-01-30T17:59:00.000Z',
    },
    {
      id: 3,
      user: 'Lorem ipsum',
      timeDuration: '03:00:00',
      facilities: 'Client Project',
      materials: 'Bagwell Avenue Ocala',
      date: '2026-01-30T17:00:00.000Z',
    },
    {
      id: 4,
      user: 'Dolor Sit',
      timeDuration: '02:45:00',
      facilities: 'Admin Dashboard',
      materials: 'Washburn Baton Rouge',
      date: '2026-01-29T17:00:00.000Z',
    },
    {
      id: 5,
      user: 'Elit Quisque',
      timeDuration: '03:30:00',
      facilities: 'App Landing page',
      materials: 'Nest Lane Olivette',
      date: '2025-02-02T17:00:00.000Z',
    },
    {
      id: 6,
      user: 'First Last',
      timeDuration: '02:30:00',
      facilities: 'Landing Page',
      materials: 'Meadow Lane Oakland',
      date: '2026-01-30T18:00:00.000Z',
    },
    {
      id: 7,
      user: 'Test Last',
      timeDuration: '02:20:00',
      facilities: 'CRM Admin pages',
      materials: 'Larry San Francisco',
      date: '2026-01-30T17:59:00.000Z',
    },
    {
      id: 8,
      user: 'Lorem ipsum',
      timeDuration: '03:00:00',
      facilities: 'Client Project',
      materials: 'Bagwell Avenue Ocala',
      date: '2026-01-30T17:00:00.000Z',
    },
    {
      id: 9,
      user: 'Dolor Sit',
      timeDuration: '02:45:00',
      facilities: 'Admin Dashboard',
      materials: 'Washburn Baton Rouge',
      date: '2026-01-29T17:00:00.000Z',
    },
    {
      id: 10,
      user: 'Elit Quisque',
      timeDuration: '03:30:00',
      facilities: 'App Landing page',
      materials: 'Nest Lane Olivette',
      date: '2025-02-02T17:00:00.000Z',
    },
    {
      id: 11,
      user: 'Elit Quisque',
      timeDuration: '03:30:00',
      facilities: 'App Landing page',
      materials: 'Nest Lane Olivette',
      date: '2025-02-02T17:00:00.000Z',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem('resourceSearch') || '');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    localStorage.setItem('resourceSearch', searchTerm);
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  const filteredResources = resources.filter(resource =>
    resource.user.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredResources.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentResources = filteredResources.slice(startIndex, endIndex);

  const goToPage = page => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div
      className={`${styles.resourceManagementPage} ${
        darkMode ? styles.resourceManagementDarkMode : ''
      }`}
    >
      <div className={styles.dashboardTitle}>
        <h2>Used Resources</h2>
        <button type="button" className={styles.addLogButton}>
          Add New Log
        </button>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClear={() => setSearchTerm('')}
      />

      <div className={styles.resourceList}>
        <div className={styles.resourceHeading}>
          <div className={styles.checkboxContainer}>
            <input type="checkbox" />
          </div>
          <div className={styles.resourceHeadingItem}>User</div>
          <div className={styles.resourceHeadingItem} title="Session Length">
            Time/Duration
          </div>
          <div className={styles.resourceHeadingItem}>Facilities</div>
          <div className={styles.resourceHeadingItem}>Materials</div>
          <div className={styles.resourceHeadingItem}>Date</div>
        </div>
        <hr className={styles.lineSperator} />
        <div className={styles.itemsPerPage}>
          <label>Rows per page:</label>
          <select
            value={itemsPerPage}
            onChange={e => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        {filteredResources.length === 0 ? (
          <div className={styles.noResultsMessage}>No user found</div>
        ) : (
          currentResources.map(resource => (
            <div key={resource.id}>
              <div className={styles.resourceItem}>
                <div className={styles.checkboxContainer}>
                  <input type="checkbox" />
                </div>
                <div className={styles.resourceItemDetail}>{resource.user}</div>
                <div className={styles.resourceItemDetail} title="Session Length">
                  {resource.timeDuration}
                </div>
                <div className={styles.resourceItemDetail}>{resource.facilities}</div>
                <div className={styles.resourceItemDetail}>{resource.materials}</div>
                <div className={styles.resourceItemDetail}>
                  <span className={styles.calendarIcon}>📅</span>{' '}
                  {formatDateTimeLocal(resource.date)}
                </div>
              </div>
              <hr className={styles.lineSperator} />
            </div>
          ))
        )}
      </div>

      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={prevPage}
          disabled={currentPage === 1}
        >
          ←
        </button>

        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;
          return (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={currentPage === page ? styles.activePage : ''}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          className={styles.arrowButton}
          onClick={nextPage}
          disabled={currentPage === totalPages}
        >
          →
        </button>
      </div>

      <div className={styles.recordCount}>
        Showing {totalItems === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, totalItems)} of{' '}
        {totalItems}
      </div>
    </div>
  );
}

export default ResourceManagement;
