import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import styles from './ResourceManagement.module.css';
import { MOCK_RESOURCES } from './MockData';

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
          placeholder="Search ..."
          value={searchTerm}
          onChange={onSearchTermChange}
        />
      </div>
    </div>
  );
}

const Pagination = ({ totalPages, currentPage, setCurrentPage, darkMode }) => {
  const getPaginationGroup = () => {
    const threshold = 5;

    if (totalPages <= threshold) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage > totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div
      className={`${styles.paginationContainer} ${
        darkMode ? styles.darkModePaginationContainer : ''
      }`}
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        className={styles.paginationLeft}
        aria-label="Previous page"
      >
        <ChevronLeft size={20} />
      </button>

      {getPaginationGroup().map((value, index) => (
        <button
          key={`page-${value}-${index}`}
          type="button"
          className={value === currentPage ? styles.activePage : styles.paginationButtonIndexes}
          onClick={() => {
            if (typeof value === 'number') setCurrentPage(value);
            else toast.info('Navigate using numbers or arrows.');
          }}
          disabled={value === currentPage}
        >
          {value}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        className={styles.paginationRight}
        aria-label="Next page"
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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const onSearchTermChange = e => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredResources = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return resources;

    return resources.filter(
      resource =>
        resource.user.toLowerCase().includes(term) ||
        resource.facilities.toLowerCase().includes(term) ||
        resource.materials.toLowerCase().includes(term) ||
        resource.date.toLowerCase().includes(term),
    );
  }, [resources, searchTerm]);

  const sortedResources = useMemo(() => {
    const sortableItems = [...filteredResources];

    sortableItems.sort((a, b) => {
      const valA = sortConfig.key === 'date' ? a.timestamp : a[sortConfig.key]?.toLowerCase();
      const valB = sortConfig.key === 'date' ? b.timestamp : b[sortConfig.key]?.toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sortableItems;
  }, [filteredResources, sortConfig]);

  const totalItems = sortedResources.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResources = sortedResources.slice(startIndex, endIndex);

  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const toggleGlobalDirection = () => {
    setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }));
    setCurrentPage(1);
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

      <div className={styles.itemsPerPage}>
        <label htmlFor="rowsPerPage">Rows per page:</label>
        <select
          id="rowsPerPage"
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

      <div className={styles.resourceList}>
        <div className={styles.resourceTable}>
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

          {currentResources.map(resource => (
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

      <div className={styles.recordCount}>
        Showing {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
        {totalItems}
      </div>
    </div>
  );
}

SearchBar.propTypes = {
  onSortToggle: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  searchTerm: PropTypes.string.isRequired,
  onSearchTermChange: PropTypes.func.isRequired,
};

SearchBar.defaultProps = {
  darkMode: false,
};

Pagination.propTypes = {
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

Pagination.defaultProps = {
  darkMode: false,
};

export default ResourceManagement;
