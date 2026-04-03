import { useState, useEffect } from 'react';
import styles from './ResourceManagement.module.css';
import { useSelector } from 'react-redux';

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
    {
      id: 11,
      user: 'First Last',
      timeDuration: '02:30:00',
      facilities: 'Landing Page',
      materials: 'Meadow Lane Oakland',
      date: '2026-01-30T18:00:00.000Z',
    },
    {
      id: 12,
      user: 'Test Last',
      timeDuration: '02:20:00',
      facilities: 'CRM Admin pages',
      materials: 'Larry San Francisco',
      date: '2026-01-30T17:59:00.000Z',
    },
    {
      id: 13,
      user: 'Lorem ipsum',
      timeDuration: '03:00:00',
      facilities: 'Client Project',
      materials: 'Bagwell Avenue Ocala',
      date: '2026-01-30T17:00:00.000Z',
    },
    {
      id: 14,
      user: 'Dolor Sit',
      timeDuration: '02:45:00',
      facilities: 'Admin Dashboard',
      materials: 'Washburn Baton Rouge',
      date: '2026-01-29T17:00:00.000Z',
    },
    {
      id: 15,
      user: 'Elit Quisque',
      timeDuration: '03:30:00',
      facilities: 'App Landing page',
      materials: 'Nest Lane Olivette',
      date: '2025-02-02T17:00:00.000Z',
    },
    {
      id: 16,
      user: 'Elit Quisque',
      timeDuration: '03:30:00',
      facilities: 'App Landing page',
      materials: 'Nest Lane Olivette',
      date: '2025-02-02T17:00:00.000Z',
    },
  ]);

  const [filteredResources, setFilteredResources] = useState(resources);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    localStorage.setItem('resourceSearch', searchTerm);
    setCurrentPage(1);
    setFilteredResources(resources);
  }, [resources]);

  const handleSearch = term => {
    setSearchTerm(term);

    if (!term.trim()) {
      setFilteredResources(resources);
      return;
    }

    const filtered = resources.filter(
      resource =>
        resource.user.toLowerCase().includes(term.toLowerCase()) ||
        resource.facilities.toLowerCase().includes(term.toLowerCase()) ||
        resource.materials.toLowerCase().includes(term.toLowerCase()) ||
        resource.date.toLowerCase().includes(term.toLowerCase()),
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

  console.log('totalItems:', totalItems);
  console.log('itemsPerPage:', itemsPerPage);
  console.log('totalPages:', totalPages);

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.resourceManagementDashboard}`}>
        <div className={`${styles.dashboardTitle}`}>
          <h2>Used Resources</h2>
          <button
            type="button"
            className={`${styles.addLogButton}`}
            onClick={() => setIsModalOpen(true)}
          >
            Add New Log
          </button>
        </div>

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

        <SearchBar onSearch={handleSearch} />

        <div className={`${styles.resourceList}`}>
          <div className={`${styles.resourceHeading}`}>
            <div className={`${styles.checkboxContainer}`}>
              <input type="checkbox" />
            </div>
            <div className={`${styles.resourceHeadingItem}`}>User</div>
            <div className={`${styles.resourceHeadingItem}`}>Time/Duration</div>
            <div className={`${styles.resourceHeadingItem}`}>Facilities</div>
            <div className={`${styles.resourceHeadingItem}`}>Materials</div>
            <div className={`${styles.resourceHeadingItem}`}>Date</div>
          </div>
          <hr className={`${styles.lineSperator}`} />

          {currentResources.map(resource => (
            <div key={resource.id}>
              <div className={`${styles.resourceItem}`}>
                <div className={`${styles.checkboxContainer}`}>
                  <input type="checkbox" />
                </div>
                <div className={`${styles.resourceItemDetail}`}>{resource.user}</div>
                <div className={`${styles.resourceItemDetail}`}>{resource.timeDuration}</div>
                <div className={`${styles.resourceItemDetail}`}>{resource.facilities}</div>
                <div className={`${styles.resourceItemDetail}`}>{resource.materials}</div>
                <div className={`${styles.resourceItemDetail}`}>
                  <span className={`${styles.calendarIcon}`}>📅</span> {resource.date}
                </div>
              </div>
              <hr className={`${styles.lineSperator}`} />
            </div>
          ))}
        </div>

        <div className={styles.rmPagination}>
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

          <AddLogModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAddLog}
          />
        </div>
      </div>

      <div className={styles.recordCount}>
        Showing {totalItems === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, totalItems)} of{' '}
        {totalItems}
      </div>
    </div>
  );
}

export default ResourceManagement;
