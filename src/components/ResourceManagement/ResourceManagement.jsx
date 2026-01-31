import { useState, useEffect } from 'react';
import styles from './ResourceManagement.module.css';

import ResourceManagementForm from './ResourceManagementForm';
function SearchBar({ onSearch, searchTerm }) {
  return (
    <div className={styles.searchBarContainer}>
@@ -26,96 +26,115 @@ function SearchBar({ onSearch, searchTerm }) {
}

function ResourceManagement() {
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
  // const [resources] = useState([
  //   {
  //     id: 1,
  //     user: 'First Last',
  //     timeDuration: '02:32:56',
  //     facilities: 'Landing Page',
  //     materials: 'Meadow Lane Oakland',
  //     date: 'Just now',
  //   },
  //   {
  //     id: 2,
  //     user: 'First Last',
  //     timeDuration: '02:32:56',
  //     facilities: 'CRM Admin pages',
  //     materials: 'Larry San Francisco',
  //     date: 'A minute ago',
  //   },
  //   {
  //     id: 3,
  //     user: 'First Last',
  //     timeDuration: '02:32:56',
  //     facilities: 'Client Project',
  //     materials: 'Bagwell Avenue Ocala',
  //     date: '1 hour ago',
  //   },
  //   {
  //     id: 4,
  //     user: 'First Last',
  //     timeDuration: '02:32:56',
  //     facilities: 'Admin Dashboard',
  //     materials: 'Washburn Baton Rouge',
  //     date: 'Yesterday',
  //   },
  //   {
  //     id: 5,
  //     user: 'First Last',
  //     timeDuration: '02:32:56',
  //     facilities: 'App Landing page',
  //     materials: 'Nest Lane Olivette',
  //     date: 'Feb 2, 2024',
  //   },
  //   {
  //     id: 6,
  //     user: 'First Last',
  //     timeDuration: '02:32:56',
  //     facilities: 'Landing Page',
  //     materials: 'Meadow Lane Oakland',
  //     date: 'Just now',
  //   },
  //   {
  //     id: 7,
  //     user: 'First Last',
  //     timeDuration: '02:32:56',
  //     facilities: 'CRM Admin Pages',
  //     materials: 'Larry San Francisco',
  //     date: 'A minute ago',
  //   },
  //   {
  //     id: 8,
  //     user: 'First Last',
  //     timeDuration: '02:32:56',
  //     facilities: 'Client Project',
  //     materials: 'Bagwell Avenue Ocala',
  //     date: '1 hour ago',
  //   },
  //   {
  //     id: 9,
  //     user: 'First Last',
  //     timeDuration: '02:32:56',
  //     facilities: 'Admin Dashboard',
  //     materials: 'Washburn Baton Rouge',
  //     date: 'Yesterday',
  //   },
  //   {
  //     id: 10,
  //     user: 'First Last',
  //     timeDuration: '02:32:56',
  //     facilities: 'App Landing Page',
  //     materials: 'Nest Lane Olivette',
  //     date: 'Feb 2, 2024',
  //   },
  // ]);

  const [resources, setResources] = useState([]);
  useEffect(() => {
    const fetchResources = async () => {
      const response = await fetch('/api/resourceManagement');
      const json = await response.json();
      if (response.ok) {
        setResources(json);
      }
    };

    fetchResources();
  }, []);

  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const [filteredResources, setFilteredResources] = useState(resources);

  useEffect(() => {
    setFilteredResources(resources);
  }, [resources]);

  const handleSearch = term => {
    setSearchTerm(term);
    const filtered = resources.filter(
      resource =>
        resource.user.toLowerCase().includes(term.toLowerCase()) ||
        resource.duration.toLowerCase().includes(term.toLowerCase()) ||
        resource.facilities.toLowerCase().includes(term.toLowerCase()) ||
        resource.materials.toLowerCase().includes(term.toLowerCase()) ||
        resource.date.toLowerCase().includes(term.toLowerCase()),
@@ -127,9 +146,7 @@ function ResourceManagement() {
    <div className={styles.resourceManagementDashboard}>
      <div className={styles.dashboardTitle}>
        <h2>Used Resources</h2>
        <button type="button" className={styles.addLogButton}>
          Add New Log
        </button>
        <ResourceManagementForm />
      </div>

      <SearchBar onSearch={handleSearch} searchTerm={searchTerm} />
@@ -140,30 +157,32 @@ function ResourceManagement() {
            <input type="checkbox" />
          </div>
          <div className={styles.resourceHeadingItem}>User</div>
          <div className={styles.resourceHeadingItem}>Time/Duration</div>
          <div className={styles.resourceHeadingItem}>Duration</div>
          <div className={styles.resourceHeadingItem}>Facilities</div>
          <div className={styles.resourceHeadingItem}>Materials</div>
          <div className={styles.resourceHeadingItem}>Date</div>
        </div>
        <hr className={styles.lineSperator} />

        {filteredResources.map(resource => (
          <div key={resource.id}>
            <div className={styles.resourceItem}>
              <div className={styles.checkboxContainer}>
                <input type="checkbox" />
              </div>
              <div className={styles.resourceItemDetail}>{resource.user}</div>
              <div className={styles.resourceItemDetail}>{resource.timeDuration}</div>
              <div className={styles.resourceItemDetail}>{resource.facilities}</div>
              <div className={styles.resourceItemDetail}>{resource.materials}</div>
              <div className={styles.resourceItemDetail}>
                <span className={styles.calendarIcon}>📅</span> {resource.date}
        {resources &&
          filteredResources &&
          filteredResources.map(resource => (
            <div key={resource.id}>
              <div className={styles.resourceItem}>
                <div className={styles.checkboxContainer}>
                  <input type="checkbox" />
                </div>
                <div className={styles.resourceItemDetail}>{resource.user}</div>
                <div className={styles.resourceItemDetail}>{resource.duration}</div>
                <div className={styles.resourceItemDetail}>{resource.facilities}</div>
                <div className={styles.resourceItemDetail}>{resource.materials}</div>
                <div className={styles.resourceItemDetail}>
                  <span className={styles.calendarIcon}>📅</span> {resource.date}
                </div>
              </div>
              <hr className={styles.lineSperator} />
            </div>
            <hr className={styles.lineSperator} />
          </div>
        ))}
          ))}
      </div>

      <div className="pagination">
        <button type="button" className={styles.arrowButton}>
          ←
        </button>
        <button type="button">1</button>
        <button type="button">2</button>
        <button type="button">3</button>
        <button type="button">4</button>
        <button type="button">5</button>
        <button type="button" className={styles.arrowButton}>
          →
        </button>
      </div>
    </div>
  );
}
export default ResourceManagement;
