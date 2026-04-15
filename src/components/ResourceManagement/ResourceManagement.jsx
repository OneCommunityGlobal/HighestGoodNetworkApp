import { useState, useMemo } from 'react';
import styles from './ResourceManagement.module.css';
import { useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'; // Added Calendar icon
import { MOCK_RESOURCES } from './MockData';
import { toast } from 'react-toastify';

function SearchBar({ onSortToggle, darkMode, searchTerm, onSearchTermChange }) {
  return (
    <div
      className={`${styles.searchBarContainer} ${
        darkMode ? styles.darkModeSearchBarContainer : ''
      }`}
    >
      <div className={styles.searchBarContainerLeft}>
        <span className={styles.iconAdd}>+</span>
        <span className={styles.iconLines}>=</span>
        <button
          type="button"
          className={styles.iconToggle}
          onClick={onSortToggle}
          aria-label="Toggle Global Sort Direction"
        >
          ⇅
        </button>
      </div>
      <div className={styles.searchBarContainerRight}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search resources..."
          value={searchTerm}
          onChange={onSearchTermChange}
        />
      </div>
    </div>
  );
}

const Pagination = ({ totalPages, currentPage, setCurrentPage, darkMode }) => {
  const getPaginationGroup = () => {
    let pages = [];
    const threshold = 5;
    if (totalPages <= threshold) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, 5, '...', totalPages];
      } else if (currentPage > totalPages - 3) {
        pages = [
          1,
          '...',
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }
    return pages;
  };

  return (
    <div
      className={`${styles.paginationContainer} ${
        darkMode ? styles.darkModePaginationContainer : ''
      }`}
    >
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(prev => prev - 1)}
        className={styles.paginationLeft}
      >
        <ChevronLeft size={20} />
      </button>

      {getPaginationGroup().map((value, index) => (
        <button
          key={index}
          type="button"
          className={value === currentPage ? styles.activePage : styles.paginationButtonIndexes}
          onClick={() => {
            if (typeof value === 'number') setCurrentPage(value);
            else toast.info('Navigate using numbers or arrows.');
          }}
        >
          {value}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(prev => prev + 1)}
        className={styles.paginationRight}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

function ResourceManagement() {
  const [resources] = useState(MOCK_RESOURCES);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const darkMode = useSelector(state => state.theme.darkMode);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const onSearchTermChange = e => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const filteredResources = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return resources;
    return resources.filter(
      r =>
        r.user.toLowerCase().includes(term) ||
        r.facilities.toLowerCase().includes(term) ||
        r.materials.toLowerCase().includes(term),
    );
  }, [resources, searchTerm]);

  const sortedResources = useMemo(() => {
    let sortableItems = [...filteredResources];
    sortableItems.sort((a, b) => {
      let valA = sortConfig.key === 'date' ? a.timestamp : a[sortConfig.key]?.toLowerCase();
      let valB = sortConfig.key === 'date' ? b.timestamp : b[sortConfig.key]?.toLowerCase();
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [filteredResources, sortConfig]);

  const totalPages = Math.ceil(sortedResources.length / itemsPerPage);

  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const toggleGlobalDirection = () => {
    setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  return (
    <div
      className={`${styles.resourceManagementDashboard} ${
        darkMode ? styles.darkModeResourceManagementDashboard : ''
      }`}
    >
      <div className={styles.dashboardTitle}>
        <h2>Used Resources</h2>
        <button type="button" className={styles.addLogButton}>
          Add New Log
        </button>
      </div>

      <SearchBar
        onSortToggle={toggleGlobalDirection}
        darkMode={darkMode}
        searchTerm={searchTerm}
        onSearchTermChange={onSearchTermChange}
      />

      <div className={styles.resourceList}>
        <div className={styles.resourceTable}>
          {/* THE HEADER ROW - SHARED COLUMN CLASSES */}
          <div className={styles.resourceHeaderRow}>
            <div className={styles.colCheck}>
              <input type="checkbox" aria-label="Select all" />
            </div>
            <div className={styles.colUser}>
              <button
                type="button"
                className={styles.headerSortButton}
                onClick={() => requestSort('user')}
              >
                User {sortConfig.key === 'user' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
              </button>
            </div>
            <div className={styles.colDuration}>
              <button
                type="button"
                className={styles.headerSortButton}
                onClick={() => requestSort('timeDuration')}
              >
                Time/Duration{' '}
                {sortConfig.key === 'timeDuration' &&
                  (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
              </button>
            </div>
            <div className={styles.colFacilities}>Facilities</div>
            <div className={styles.colMaterials}>Materials</div>
            <div className={styles.colDate}>
              <button
                type="button"
                className={styles.headerSortButton}
                onClick={() => requestSort('date')}
              >
                Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
              </button>
            </div>
          </div>

          {/* THE DATA ROWS */}
          {sortedResources
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map(resource => (
              <div key={resource.id} className={styles.resourceItem}>
                <div className={styles.colCheck}>
                  <input type="checkbox" aria-label={`Select ${resource.user}`} />
                </div>
                <div className={`${styles.resourceItemDetail} ${styles.colUser}`}>
                  {resource.user}
                </div>
                <div className={`${styles.resourceItemDetail} ${styles.colDuration}`}>
                  {resource.timeDuration}
                </div>
                <div className={`${styles.resourceItemDetail} ${styles.colFacilities}`}>
                  {resource.facilities}
                </div>
                <div className={`${styles.resourceItemDetail} ${styles.colMaterials}`}>
                  {resource.materials}
                </div>
                <div className={`${styles.resourceItemDetail} ${styles.colDate}`}>
                  <Calendar size={14} className={styles.calendarIcon} /> {resource.date}
                </div>
              </div>
            ))}
        </div>
      </div>

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
      />
    </div>
  );
}

export default ResourceManagement;
