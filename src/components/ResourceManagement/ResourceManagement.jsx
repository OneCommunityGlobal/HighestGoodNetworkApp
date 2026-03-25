import { useState, useEffect } from 'react';
import styles from './ResourceManagement.module.css';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';

function SearchBar({ onSearch }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.searchBarContainer}`}>
        <div className={`${styles.searchBarContainerLeft}`}>
          <span className={`${styles.iconAdd}`}>+</span>
          <span className={`${styles.iconLines}`}>=</span>
          <span className={`${styles.iconToggle}`}>⇅</span>
        </div>
        <div className={`${styles.searchBarContainerRight}`}>
          <input
            type="text"
            className={`${styles.searchInput}`}
            placeholder="Search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button type="button" className={`${styles.searchButton}`} onClick={handleSearch}>
            Search
          </button>
        </div>
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
  });
  const [validationError, setValidationError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (formData.user && formData.timeDuration && formData.facilities && formData.materials) {
      onAdd(formData);
      setFormData({
        user: '',
        timeDuration: '',
        facilities: '',
        materials: '',
      });
      setValidationError('');
      onClose();
    } else {
      setValidationError('Please fill in all fields');
    }
  };

  const handleOverlayClick = e => {
    // Only close if clicking directly on the overlay, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOverlayKeyDown = e => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscKey = e => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div
        className={`${styles.modalOverlay}`}
        onClick={handleOverlayClick}
        onKeyDown={handleOverlayKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      >
        <div
          className={`${styles.modalContent}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className={`${styles.modalHeader}`}>
            <h3 id="modal-title">Add New Log</h3>
            <button type="button" className={`${styles.closeButton}`} onClick={onClose}>
              ×
            </button>
          </div>
          {validationError && (
            <div className={`${styles.errorMessage}`} role="alert">
              {validationError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className={`${styles.formGroup}`}>
              <label htmlFor="user">User:</label>
              <input
                id="user"
                type="text"
                name="user"
                value={formData.user}
                onChange={handleChange}
                placeholder="First Last"
              />
            </div>
            <div className={`${styles.formGroup}`}>
              <label htmlFor="timeDuration">Time/Duration:</label>
              <input
                id="timeDuration"
                type="text"
                name="timeDuration"
                value={formData.timeDuration}
                onChange={handleChange}
                placeholder="00:00:00"
              />
            </div>
            <div className={`${styles.formGroup}`}>
              <label htmlFor="facilities">Facilities:</label>
              <input
                id="facilities"
                type="text"
                name="facilities"
                value={formData.facilities}
                onChange={handleChange}
                placeholder="e.g., Landing Page"
              />
            </div>
            <div className={`${styles.formGroup}`}>
              <label htmlFor="materials">Materials:</label>
              <input
                id="materials"
                type="text"
                name="materials"
                value={formData.materials}
                onChange={handleChange}
                placeholder="e.g., Location"
              />
            </div>
            <div className={`${styles.modalActions}`}>
              <button type="button" className={`${styles.cancelButton}`} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={`${styles.submitButton}`}>
                Add Log
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ResourceManagement() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [resources, setResources] = useState([
    {
      id: 1,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Landing Page',
      materials: 'Meadow Lane Oakland',
      date: 'Just now',
    },
    {
      id: 2,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'CRM Admin pages',
      materials: 'Larry San Francisco',
      date: 'A minute ago',
    },
    {
      id: 3,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Client Project',
      materials: 'Bagwell Avenue Ocala',
      date: '1 hour ago',
    },
    {
      id: 4,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Admin Dashboard',
      materials: 'Washburn Baton Rouge',
      date: 'Yesterday',
    },
    {
      id: 5,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'App Landing page',
      materials: 'Nest Lane Olivette',
      date: 'Feb 2, 2024',
    },
    {
      id: 6,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Landing Page',
      materials: 'Meadow Lane Oakland',
      date: 'Just now',
    },
    {
      id: 7,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'CRM Admin Pages',
      materials: 'Larry San Francisco',
      date: 'A minute ago',
    },
    {
      id: 8,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Client Project',
      materials: 'Bagwell Avenue Ocala',
      date: '1 hour ago',
    },
    {
      id: 9,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Admin Dashboard',
      materials: 'Washburn Baton Rouge',
      date: 'Yesterday',
    },
    {
      id: 10,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'App Landing Page',
      materials: 'Nest Lane Olivette',
      date: 'Feb 2, 2024',
    },
  ]);
  const [filteredResources, setFilteredResources] = useState(resources);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    setFilteredResources(resources);
  }, [resources]);

  const handleSearch = searchTerm => {
    if (!searchTerm.trim()) {
      setFilteredResources(resources);
      return;
    }

    const filtered = resources.filter(
      resource =>
        resource.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.facilities.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.materials.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.date.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredResources(filtered);
  };

  const handleAddLog = newLog => {
    const newResource = {
      id: resources.length + 1,
      ...newLog,
      date: 'Just now',
    };
    setResources(prev => [newResource, ...prev]);
  };

  /* -------------------- EXPORT LOGIC -------------------- */

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
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated;
    });
  };

  const getExportRows = () =>
    selectedIds.size > 0 ? filteredResources.filter(r => selectedIds.has(r.id)) : filteredResources;

  const exportCSV = rows => {
    const header = columns.map(col => col.label).join(',');
    const body = rows
      .map(row => columns.map(col => `"${row[col.key] ?? ''}"`).join(','))
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
    if (!rows.length) return;
    format === 'csv' ? exportCSV(rows) : exportXLSX(rows);
  };

  /* ----------------------------------------------------- */

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.resourceManagementDashboard}>
        <div className={styles.dashboardTitle}>
          <h2>Used Resources</h2>
          <div className={styles.actionButtons}>
            <button
              type="button"
              className={styles.addLogButton}
              onClick={() => setIsModalOpen(true)}
            >
              Add New Log
            </button>

            <button
              type="button"
              className={styles.addLogButton}
              onClick={() => handleExport('csv')}
            >
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

        <SearchBar onSearch={handleSearch} />

        <div className={styles.resourceList}>
          <div className={styles.resourceHeading}>
            <div className={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={selectedIds.size === filteredResources.length}
                onChange={e =>
                  setSelectedIds(
                    e.target.checked ? new Set(filteredResources.map(r => r.id)) : new Set(),
                  )
                }
              />
            </div>

            <div className={styles.resourceHeadingItem}>User</div>
            <div className={styles.resourceHeadingItem}>Time/Duration</div>
            <div className={styles.resourceHeadingItem}>Facilities</div>
            <div className={styles.resourceHeadingItem}>Materials</div>
            <div className={styles.resourceHeadingItem}>Date</div>
          </div>

          {filteredResources.map(resource => (
            <div key={resource.id}>
              <div className={styles.resourceItem}>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(resource.id)}
                    onChange={() => toggleSelect(resource.id)}
                  />
                </div>

                <div className={styles.resourceItemDetail}>{resource.user}</div>
                <div className={styles.resourceItemDetail}>{resource.timeDuration}</div>
                <div className={styles.resourceItemDetail}>{resource.facilities}</div>
                <div className={styles.resourceItemDetail}>{resource.materials}</div>
                <div className={styles.resourceItemDetail}>
                  <span className={styles.calendarIcon}>📅</span> {resource.date}
                </div>
              </div>

              <hr className={styles.lineSperator} />
            </div>
          ))}
        </div>

        <div className={`${styles.rmPagination}`}>
          <button type="button" className={`${styles.arrowButton}`}>
            ←
          </button>
          <button type="button">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">4</button>
          <button type="button">5</button>
          <button type="button" className={`${styles.arrowButton}`}>
            →
          </button>
        </div>

        <AddLogModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddLog}
        />
      </div>
    </div>
  );
}

export default ResourceManagement;
