import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
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

function AddLogModal({ isOpen, onClose, onAdd }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [formData, setFormData] = useState({
    user: '',
    timeDuration: '',
    facilities: '',
    materials: '',
    date: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    setErrors(prev => ({
      ...prev,
      [name]: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    const textRegex = /^[a-zA-Z\s]+$/;

    if (!formData.user.trim()) newErrors.user = 'User is required';

    if (!formData.timeDuration.trim()) {
      newErrors.timeDuration = 'Time/Duration is required';
    } else if (!timeRegex.test(formData.timeDuration)) {
      newErrors.timeDuration = 'Time must be in HH:MM:SS format';
    }

    if (!formData.facilities.trim()) {
      newErrors.facilities = 'Facilities is required';
    } else if (!textRegex.test(formData.facilities)) {
      newErrors.facilities = 'Facilities should contain only letters';
    }

    if (!formData.materials.trim()) {
      newErrors.materials = 'Materials is required';
    } else if (!textRegex.test(formData.materials)) {
      newErrors.materials = 'Materials should contain only letters';
    }

    if (!formData.date) newErrors.date = 'Date is required';

    return newErrors;
  };

  const handleSubmit = e => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onAdd(formData);

    setFormData({
      user: '',
      timeDuration: '',
      facilities: '',
      materials: '',
      date: '',
    });

    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${darkMode ? styles.modalContentDark : ''}`}>
        <h3>Add New Log</h3>

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          {['user', 'timeDuration', 'facilities', 'materials'].map(field => (
            <div className={styles.formGroup} key={field}>
              <label htmlFor={field}>
                {field === 'timeDuration'
                  ? 'Time/Duration'
                  : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className={errors[field] ? styles.inputError : ''}
              />
              {errors[field] && <span className={styles.errorText}>{errors[field]}</span>}
            </div>
          ))}

          <div className={styles.formGroup}>
            <label htmlFor="resource-date">Date</label>
            <input
              id="resource-date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className={errors.date ? styles.inputError : ''}
            />
            {errors.date && <span className={styles.errorText}>{errors.date}</span>}
          </div>

          <div className={styles.modalActions}>
            <button type="submit" className={styles.submitButton}>
              Save Log
            </button>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Pagination = ({ totalPages, currentPage, setCurrentPage, darkMode }) => {
  const getPaginationGroup = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5, '...', totalPages];
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
  const darkMode = useSelector(state => state.theme.darkMode);
  const [resources, setResources] = useState(MOCK_RESOURCES);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const columns = [
    { key: 'user', label: 'User' },
    { key: 'timeDuration', label: 'Time/Duration' },
    { key: 'facilities', label: 'Facilities' },
    { key: 'materials', label: 'Materials' },
    { key: 'date', label: 'Date' },
  ];

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
      const valA = sortConfig.key === 'date' ? a.timestamp ?? 0 : a[sortConfig.key]?.toLowerCase();
      const valB = sortConfig.key === 'date' ? b.timestamp ?? 0 : b[sortConfig.key]?.toLowerCase();

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

  const toggleSelect = id => {
    setSelectedIds(prev => {
      const updated = new Set(prev);

      if (updated.has(id)) updated.delete(id);
      else updated.add(id);

      return updated;
    });
  };

  const toggleSelectAll = e => {
    setSelectedIds(
      e.target.checked ? new Set(sortedResources.map(resource => resource.id)) : new Set(),
    );
  };

  const getExportRows = () =>
    selectedIds.size > 0
      ? sortedResources.filter(resource => selectedIds.has(resource.id))
      : sortedResources;

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

    if (format === 'csv') exportCSV(rows);
    else exportXLSX(rows);
  };

  const requestSort = key => {
    let direction = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const toggleGlobalDirection = () => {
    setSortConfig(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  };

  const handleAddLog = newLog => {
    const newResource = {
      id: resources.length + 1,
      ...newLog,
      date: 'Just now',
      timestamp: Date.now(),
    };

    setResources(prev => [newResource, ...prev]);
    setCurrentPage(1);
    setShowToast(true);
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
          <button type="button" className={styles.addLogButton} onClick={() => setShowModal(true)}>
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

          {currentResources.map(resource => (
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

      <div className={styles.recordCount}>
        Showing {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
        {totalItems}
      </div>

      <AddLogModal isOpen={showModal} onClose={() => setShowModal(false)} onAdd={handleAddLog} />

      {showToast && (
        <div className={`${styles.toast} ${darkMode ? styles.toastDark : ''}`}>
          <span>✅ Log saved successfully!</span>
          <button
            type="button"
            className={styles.toastCloseButton}
            onClick={() => setShowToast(false)}
            aria-label="Close notification"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
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

AddLogModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
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
