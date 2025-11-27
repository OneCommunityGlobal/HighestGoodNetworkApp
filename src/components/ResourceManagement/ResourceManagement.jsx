import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Equal, ArrowUpDown, X } from 'lucide-react';
import styles from './ResourceManagement.module.css';

function SearchBar({ darkMode }) {
  return (
    <div
      className={`${styles.searchBarContainer} ${darkMode ? styles.searchBarContainerDark : ''}`}
    >
      <div className={styles.searchBarContainerLeft}>
        <Plus size={20} className={`${styles.icon} ${darkMode ? styles.iconDark : ''}`} />
        <Equal size={20} className={`${styles.icon} ${darkMode ? styles.iconDark : ''}`} />
        <ArrowUpDown size={20} className={`${styles.icon} ${darkMode ? styles.iconDark : ''}`} />
      </div>

      <div className={styles.searchBarContainerRight}>
        <input
          type="text"
          className={`${styles.searchInput} ${darkMode ? styles.searchInputDark : ''}`}
          placeholder="Search"
        />
        <button
          type="button"
          className={`${styles.searchButton} ${darkMode ? styles.searchButtonDark : ''}`}
        >
          Search
        </button>
      </div>
    </div>
  );
}

function ResourceManagement() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    user: '',
    timeDuration: '',
    facilities: '',
    materials: '',
    date: '',
  });

  const [resources] = useState([
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
      facilities: 'CRM Admin Pages',
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
      facilities: 'App Landing Page',
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

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setShowModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
    setFormData({ user: '', timeDuration: '', facilities: '', materials: '', date: '' });
  };

  return (
    <div
      className={`${styles.resourceManagementDashboard} ${
        darkMode ? styles.resourceManagementDashboardDark : ''
      }`}
    >
      <div className={styles.dashboardTitle}>
        <h2 className={`${darkMode ? styles.dashboardTitleDark : ''}`}>Used Resources</h2>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={`${styles.addLogButton} ${darkMode ? styles.addLogButtonDark : ''}`}
        >
          + Add New Log
        </button>
      </div>

      <SearchBar darkMode={darkMode} />

      <div className={`${styles.resourceList} ${darkMode ? styles.resourceListDark : ''}`}>
        <div className={styles.resourceHeading}>
          <div className={styles.checkboxContainer}>
            <input type="checkbox" className={styles.customCheckbox} />
          </div>
          <div className={styles.resourceHeadingItem}>User</div>
          <div className={styles.resourceHeadingItem}>Time/Duration</div>
          <div className={styles.resourceHeadingItem}>Facilities</div>
          <div className={styles.resourceHeadingItem}>Materials</div>
          <div className={styles.resourceHeadingItem}>Date</div>
        </div>
        <hr className={styles.lineSperator} />

        {resources.map(resource => (
          <div key={resource.id}>
            <div className={styles.resourceItem}>
              <div className={styles.checkboxContainer}>
                <input type="checkbox" className={styles.customCheckbox} />
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

      <div className={styles.rmPagination}>
        <button
          type="button"
          className={`${styles.pageButton} ${darkMode ? styles.pageButtonDark : ''}`}
        >
          ←
        </button>
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            type="button"
            className={`${styles.pageButton} ${darkMode ? styles.pageButtonDark : ''}`}
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.pageButton} ${darkMode ? styles.pageButtonDark : ''}`}
        >
          →
        </button>
      </div>

      {/* Modal Popup for Adding New Log */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          role="button"
          tabIndex={0}
          onClick={() => setShowModal(false)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') setShowModal(false);
          }}
        >
          {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
          <div
            className={`${styles.modalContent} ${darkMode ? styles.modalContentDark : ''}`}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            <h3>Add New Resource Log</h3>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
              <label>
                User:
                <input name="user" value={formData.user} onChange={handleChange} required />
              </label>
              <label>
                Time/Duration:
                <input
                  name="timeDuration"
                  value={formData.timeDuration}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Facilities:
                <input
                  name="facilities"
                  value={formData.facilities}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Materials:
                <input
                  name="materials"
                  value={formData.materials}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Date:
                <input name="date" value={formData.date} onChange={handleChange} required />
              </label>

              <div className={styles.modalButtons}>
                <button type="submit" className={styles.submitButton}>
                  Save Log
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
        </div>
      )}

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

export default ResourceManagement;
