import { useState, useMemo } from 'react';
import styles from './ResourceManagement.module.css';
import { useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { MOCK_RESOURCES } from './MockData';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';

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
    let pages = [];
    const threshold = 5;

    if (totalPages <= threshold) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 3) {
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

    return pages;
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
        onClick={() => setCurrentPage(prev => prev - 1)}
        className={styles.paginationLeft}
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
        >
          {value}
        </button>
      ))}

      <button
        type="button"
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
  const [selectedIds, setSelectedIds] = useState(new Set());
  const itemsPerPage = 5;

  const onSearchTermChange = e => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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

  const totalPages = Math.ceil(sortedResources.length / itemsPerPage);

  const columns = [
    { key: 'user', label: 'User' },
    { key: 'timeDuration', label: 'Time/Duration' },
    { key: 'facilities', label: 'Facilities' },
    { key: 'materials', label: 'Materials' },
    { key: 'date', label: 'Date' },
  ];

  const toggleSelect = id => {
    setSelectedIds(prev => {
      const updated = new Set(prev);

      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }

      return updated;
    });
  };

  const toggleSelectAll = e => {
    setSelectedIds(e.target.checked ? new Set(sortedResources.map(r => r.id)) : new Set());
  };

  const getExportRows = () =>
    selectedIds.size > 0 ? sortedResources.filter(r => selectedIds.has(r.id)) : sortedResources;

  const exportCSV = rows => {
    const header = columns.map(col => col.label).join(',');
    const body = rows
      .map(row =>
        columns.map(col => `"${String(row[col.key] ?? '').replaceAll('"', '""')}"`).join(','),
      )
      .join('\n');

    const blob = new Blob([`${header}\n${body}`], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `used-resources_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportXLSX = rows => {
    const formattedRows = rows.map(row => {
      const obj = {};

      columns.forEach(col => {
        obj[col.label] = row[col.key];
      });

      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Used Resources');
    XLSX.writeFile(workbook, `used-resources_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExport = format => {
    const rows = getExportRows();

    if (!rows.length) {
      toast.info('No resources available to export.');
      return;
    }

    if (format === 'csv') {
      exportCSV(rows);
    } else {
      exportXLSX(rows);
    }
  };

  const requestSort = key => {
    let direction = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  const toggleGlobalDirection = () => {
    setSortConfig(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div
      className={`${styles.resourceManagementDashboard} ${
        darkMode ? styles.darkModeResourceManagementDashboard : ''
      }`}
    >
      <div className={styles.dashboardTitle}>
        <h2>Used Resources</h2>

        <div className={styles.actionButtons}>
          <button type="button" className={styles.addLogButton}>
            Add New Log
          </button>

          <button type="button" className={styles.addLogButton} onClick={() => handleExport('csv')}>
            Export CSV
          </button>

          <button
            type="button"
            className={styles.addLogButton}
            onClick={() => handleExport('xlsx')}
          >
            Export XLSX
          </button>
        </div>
      </div>

      <SearchBar
        onSortToggle={toggleGlobalDirection}
        darkMode={darkMode}
        searchTerm={searchTerm}
        onSearchTermChange={onSearchTermChange}
      />

      <div className={styles.resourceList}>
        <div className={styles.resourceTable}>
          <div className={styles.resourceHeaderRow}>
            <div className={styles.colCheck}>
              <input
                type="checkbox"
                aria-label="Select all"
                checked={selectedIds.size === sortedResources.length && sortedResources.length > 0}
                onChange={toggleSelectAll}
              />
              <span className={styles.checkboxLabel}>Select</span>
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

          {sortedResources
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map(resource => (
              <div key={resource.id} className={styles.resourceItem}>
                <div className={styles.colCheck}>
                  <input
                    type="checkbox"
                    aria-label={`Select ${resource.user}`}
                    checked={selectedIds.has(resource.id)}
                    onChange={() => toggleSelect(resource.id)}
                  />
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
