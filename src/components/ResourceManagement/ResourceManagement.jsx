import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './ResourceManagement.module.css';

function SearchBar({ searchTerm, onSearch, onClear }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleChange = e => {
    onSearch(e.target.value);
  };

  return (
    <div className={`${styles.searchBarContainer} ${darkMode ? styles.dark : styles.light}`}>
      <div className={styles.searchBarLeft}>
        <span>+</span>
        <span>=</span>
        <span>⇅</span>
      </div>

      <div className={styles.searchBarRight}>
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={handleChange}
          className={styles.searchInput}
        />
        <button type="button" className={styles.searchButton} onClick={() => onSearch(searchTerm)}>
          Search
        </button>
        <button type="button" className={styles.clearButton} onClick={onClear}>
          Clear
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
    date: '',
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = e => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (
      !formData.user.trim() ||
      !formData.timeDuration.trim() ||
      !formData.facilities.trim() ||
      !formData.materials.trim()
    ) {
      return;
    }

    onAdd({
      user: formData.user,
      timeDuration: formData.timeDuration,
      facilities: formData.facilities,
      materials: formData.materials,
      date: formData.date.trim() || 'Just now',
    });

    setFormData({
      user: '',
      timeDuration: '',
      facilities: '',
      materials: '',
      date: '',
    });

    onClose();
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleOverlayClick(e);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className={`${styles.modalContent} ${darkMode ? styles.dark : styles.light}`}>
        <div className={styles.modalHeader}>
          <h3>Add New Log</h3>
          <button type="button" className={styles.modalCloseButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="user">User</label>
            <input
              id="user"
              type="text"
              name="user"
              value={formData.user}
              onChange={handleChange}
              placeholder="Enter user name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="timeDuration">Time/Duration</label>
            <input
              id="timeDuration"
              type="text"
              name="timeDuration"
              value={formData.timeDuration}
              onChange={handleChange}
              placeholder="Ex: 02:32:56"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="facilities">Facilities</label>
            <input
              id="facilities"
              type="text"
              name="facilities"
              value={formData.facilities}
              onChange={handleChange}
              placeholder="Enter facility"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="materials">Materials</label>
            <input
              id="materials"
              type="text"
              name="materials"
              value={formData.materials}
              onChange={handleChange}
              placeholder="Enter materials"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="text"
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="Ex: Just now"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Add Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResourceManagement() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [resources, setResources] = useState([
    {
      id: 1,
      user: 'Last nams',
      timeDuration: '2:23:00',
      facilities: 'Home Page',
      materials: 'New york',
      date: 'Just now',
    },
    {
      id: 2,
      user: 'Shreya Kullu',
      timeDuration: '12:12:12',
      facilities: 'website',
      materials: '???',
      date: 'Just now',
    },
    {
      id: 3,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Landing Page',
      materials: 'Meadow Lane Oakland',
      date: 'Just now',
    },
    {
      id: 4,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'CRM Admin pages',
      materials: 'Larry San Francisco',
      date: 'A minute ago',
    },
    {
      id: 5,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Client Project',
      materials: 'Bagwell Avenue Ocala',
      date: '1 hour ago',
    },
    {
      id: 6,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'Admin Dashboard',
      materials: 'Washburn Baton Rouge',
      date: 'Yesterday',
    },
    {
      id: 7,
      user: 'First Last',
      timeDuration: '02:32:56',
      facilities: 'App Landing page',
      materials: 'Nest Lane Olivette',
      date: 'Feb 2, 2024',
    },
  ]);

  const [filteredResources, setFilteredResources] = useState(resources);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResources(resources);
      return;
    }

    const lower = searchTerm.toLowerCase();

    const filtered = resources.filter(
      resource =>
        resource.user.toLowerCase().includes(lower) ||
        resource.timeDuration.toLowerCase().includes(lower) ||
        resource.facilities.toLowerCase().includes(lower) ||
        resource.materials.toLowerCase().includes(lower) ||
        resource.date.toLowerCase().includes(lower),
    );

    setFilteredResources(filtered);
  }, [searchTerm, resources]);

  const handleSearch = term => {
    setSearchTerm(term);
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilteredResources(resources);
  };

  const handleAddLog = newLog => {
    setResources(prev => [
      {
        id: Date.now(),
        ...newLog,
      },
      ...prev,
    ]);
  };

  return (
    <div className={`${styles.page} ${darkMode ? styles.dark : styles.light}`}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Used Resources</h2>
        <button className={styles.addLogButton} onClick={() => setIsModalOpen(true)}>
          Add New Log
        </button>
      </div>

      <SearchBar searchTerm={searchTerm} onSearch={handleSearch} onClear={handleClear} />

      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <div className={styles.checkboxCol}>
            <input type="checkbox" />
          </div>
          <div>User</div>
          <div>Time/Duration</div>
          <div>Facilities</div>
          <div>Materials</div>
          <div>Date</div>
        </div>

        {filteredResources.map(resource => (
          <div key={resource.id} className={styles.tableRow}>
            <div className={styles.checkboxCol}>
              <input type="checkbox" />
            </div>
            <div className={styles.cell}>{resource.user}</div>
            <div className={styles.cell}>{resource.timeDuration}</div>
            <div className={styles.cell}>{resource.facilities}</div>
            <div className={styles.cell}>{resource.materials}</div>
            <div className={`${styles.cell} ${styles.dateCell}`}>
              <span className={styles.dateIcon}>🗓️</span>
              <span>{resource.date}</span>
            </div>
          </div>
        ))}
      </div>

      <AddLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddLog}
      />
    </div>
  );
}

export default ResourceManagement;
