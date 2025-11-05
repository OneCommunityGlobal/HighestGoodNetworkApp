import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Equal, ArrowUpDown, X } from 'lucide-react';
import styles from './ResourceManagement.module.css';

function SearchBar({ darkMode, searchTerm, setSearchTerm }) {
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
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className={`${styles.searchInput} ${darkMode ? styles.searchInputDark : ''}`}
          placeholder="Search"
        />
        <button
          type="button"
          onClick={() => {}}
          className={`${styles.searchButton} ${darkMode ? styles.searchButtonDark : ''}`}
        >
          Search
        </button>
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

    if (validationError) setValidationError('');
  };

  const validateForm = () => {
    if (!formData.user || !formData.timeDuration || !formData.facilities || !formData.materials) {
      return false;
    }
    return true;
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

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="button"
      tabIndex={0}
    >
      <div
        className={`${styles.modalContent} ${darkMode ? styles.modalContentDark : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <h3>Add New Log</h3>

        {validationError && (
          <div className={styles.errorMessage}>{validationError}</div>
        )}

       <form onSubmit={handleSubmit} className={styles.formContainer}>
  <div className={styles.formGroup}>
    <label>User</label>
    <input
      name="user"
      value={formData.user}
      onChange={handleChange}
      placeholder="Enter user"
    />
  </div>

  <div className={styles.formGroup}>
    <label>Time/Duration</label>
    <input
      name="timeDuration"
      value={formData.timeDuration}
      onChange={handleChange}
      placeholder="Enter time"
    />
  </div>

  <div className={styles.formGroup}>
    <label>Facilities</label>
    <input
      name="facilities"
      value={formData.facilities}
      onChange={handleChange}
      placeholder="Enter facilities"
    />
  </div>

  <div className={styles.formGroup}>
    <label>Materials</label>
    <input
      name="materials"
      value={formData.materials}
      onChange={handleChange}
      placeholder="Enter materials"
    />
  </div>

  <div className={styles.modalActions}>
    <button type="submit" className={styles.submitButton}>
      Save Log
    </button>
    <button
      type="button"
      onClick={onClose}
      className={styles.cancelButton}
    >
      Cancel
    </button>
  </div>
</form>
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

const [searchTerm, setSearchTerm] = useState('');

const handleChange = e => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = e => {
  e.preventDefault();

  if (!validateForm()) return;

  const newResource = {
    id: resources.length + 1,
    ...formData,
    date: 'Just now',
  };

  setResources(prev => [newResource, ...prev]);

  setShowModal(false);
  setShowToast(true);
  setTimeout(() => setShowToast(false), 4000);

  setFormData({
    user: '',
    timeDuration: '',
    facilities: '',
    materials: '',
    date: '',
  });
};

const filteredResources = resources.filter(resource => {
  const term = searchTerm.toLowerCase();

  return (
    resource.user.toLowerCase().includes(term) ||
    resource.facilities.toLowerCase().includes(term) ||
    resource.materials.toLowerCase().includes(term) ||
    resource.date.toLowerCase().includes(term)
  );
});

return (
  <div
    className={`${styles.resourceManagementDashboard} ${
      darkMode ? styles.resourceManagementDashboardDark : ''
    }`}
  >
    <div className={styles.dashboardTitle}>
      <h2 className={`${darkMode ? styles.dashboardTitleDark : ''}`}>
        Used Resources
      </h2>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`${styles.addLogButton} ${
          darkMode ? styles.addLogButtonDark : ''
        }`}
      >
        + Add New Log
      </button>
    </div>

    <SearchBar
      darkMode={darkMode}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />

    <div
      className={`${styles.resourceList} ${
        darkMode ? styles.resourceListDark : ''
      }`}
    >

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

        {filteredResources.map(resource => (
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
            <hr className={styles.lineSeparator} />
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

    {/* KEEP MODAL */}
    <AddLogModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onAdd={(newLog) => {
        const newResource = {
          id: resources.length + 1,
          ...newLog,
          date: 'Just now',
        };
        setResources(prev => [newResource, ...prev]);
      }}
    />

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
