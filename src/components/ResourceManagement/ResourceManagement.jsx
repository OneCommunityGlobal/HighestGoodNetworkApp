import { useState, useEffect, useMemo } from 'react';
import styles from './ResourceManagement.module.css';

// Move mock data OUTSIDE the component so it is stable and doesn't re-calculate
const MOCK_RESOURCES = [
  {
    id: 1,
    user: 'Alice Johnson',
    timeDuration: '02:32:56',
    facilities: 'Landing Page',
    materials: 'Meadow Lane Oakland',
    date: 'Just now',
    timestamp: Date.now(),
  },
  {
    id: 2,
    user: 'Zane Thompson',
    timeDuration: '01:10:00',
    facilities: 'CRM Admin pages',
    materials: 'Larry San Francisco',
    date: 'A minute ago',
    timestamp: Date.now() - 60000,
  },
  {
    id: 3,
    user: 'Bob Miller',
    timeDuration: '05:20:10',
    facilities: 'Client Project',
    materials: 'Bagwell Avenue Ocala',
    date: '1 hour ago',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 4,
    user: 'Charlie Davis',
    timeDuration: '00:45:30',
    facilities: 'Admin Dashboard',
    materials: 'Washburn Baton Rouge',
    date: 'Yesterday',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 5,
    user: 'Diana Prince',
    timeDuration: '03:15:22',
    facilities: 'App Landing page',
    materials: 'Nest Lane Olivette',
    date: 'Feb 2, 2024',
    timestamp: new Date('2024-02-02').getTime(),
  },
  {
    id: 6,
    user: 'Edward Norton',
    timeDuration: '02:32:56',
    facilities: 'Landing Page',
    materials: 'Meadow Lane Oakland',
    date: 'Just now',
    timestamp: Date.now() - 1000,
  },
  {
    id: 7,
    user: 'Fiona Gallagher',
    timeDuration: '02:32:56',
    facilities: 'CRM Admin Pages',
    materials: 'Larry San Francisco',
    date: 'A minute ago',
    timestamp: Date.now() - 61000,
  },
  {
    id: 8,
    user: 'George Clooney',
    timeDuration: '02:32:56',
    facilities: 'Client Project',
    materials: 'Bagwell Avenue Ocala',
    date: '1 hour ago',
    timestamp: Date.now() - 3601000,
  },
  {
    id: 9,
    user: 'Hannah Abbott',
    timeDuration: '02:32:56',
    facilities: 'Admin Dashboard',
    materials: 'Washburn Baton Rouge',
    date: 'Yesterday',
    timestamp: Date.now() - 86401000,
  },
  {
    id: 10,
    user: 'Ian Wright',
    timeDuration: '02:32:56',
    facilities: 'App Landing Page',
    materials: 'Nest Lane Olivette',
    date: 'Feb 2, 2024',
    timestamp: new Date('2024-02-02').getTime() - 1000,
  },
];

function SearchBar({ onSortToggle }) {
  return (
    <div className={styles.searchBarContainer}>
      <div className={styles.searchBarContainerLeft}>
        <span className={styles.iconAdd}>+</span>
        <span className={styles.iconLines}>=</span>
        {/* FIX: Changed span to button for accessibility */}
        <button
          type="button"
          className={styles.iconToggle}
          onClick={onSortToggle}
          aria-label="Toggle Global Sort Direction"
          title="Toggle Global Sort Direction"
        >
          ⇅
        </button>
      </div>
      <div className={styles.searchBarContainerRight}>
        <input type="text" className={styles.searchInput} placeholder="Search" />
        <button type="button" className={styles.searchButton}>
          Search
        </button>
      </div>
    </div>
  );
}

function ResourceManagement() {
  const [resources] = useState(MOCK_RESOURCES);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const sortedResources = useMemo(() => {
    let sortableItems = [...resources];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA, valB;

        if (sortConfig.key === 'date') {
          valA = a.timestamp;
          valB = b.timestamp;
        } else {
          valA = a[sortConfig.key].toLowerCase();
          valB = b[sortConfig.key].toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [resources, sortConfig]);

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
    <div className={styles.resourceManagementDashboard}>
      <div className={styles.dashboardTitle}>
        <h2>Used Resources</h2>
        <button type="button" className={styles.addLogButton}>
          Add New Log
        </button>
      </div>

      <SearchBar onSortToggle={toggleGlobalDirection} />

      <div className={styles.resourceList}>
        <div className={styles.resourceHeading}>
          <div className={styles.checkboxContainer}>
            <input type="checkbox" aria-label="Select all" />
          </div>

          {/* FIX: Changed divs to buttons for header sorting to fix accessibility errors */}
          <button
            type="button"
            className={styles.resourceHeadingItem}
            onClick={() => requestSort('user')}
          >
            User {sortConfig.key === 'user' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
          </button>

          <button
            type="button"
            className={styles.resourceHeadingItem}
            onClick={() => requestSort('timeDuration')}
          >
            Time/Duration{' '}
            {sortConfig.key === 'timeDuration' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
          </button>

          <div className={styles.resourceHeadingItem}>Facilities</div>
          <div className={styles.resourceHeadingItem}>Materials</div>

          <button
            type="button"
            className={styles.resourceHeadingItem}
            onClick={() => requestSort('date')}
          >
            Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}
          </button>
        </div>

        <hr className={styles.lineSperator} />

        {sortedResources.map(resource => (
          <div key={resource.id}>
            <div className={styles.resourceItem}>
              <div className={styles.checkboxContainer}>
                <input type="checkbox" aria-label={`Select ${resource.user}`} />
              </div>
              <div className={styles.resourceItemDetail}>{resource.user}</div>
              <div className={styles.resourceItemDetail}>{resource.timeDuration}</div>
              <div className={styles.resourceItemDetail}>{resource.facilities}</div>
              <div className={styles.resourceItemDetail}>{resource.materials}</div>
              <div className={styles.resourceItemDetail}>
                <span className={styles.calendarIcon} aria-hidden="true">
                  📅
                </span>{' '}
                {resource.date}
              </div>
            </div>
            <hr className={styles.lineSperator} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResourceManagement;
