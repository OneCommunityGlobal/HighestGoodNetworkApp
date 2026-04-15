import { useState, useEffect, useMemo } from 'react';
import styles from './ResourceManagement.module.css';
import { useSelector } from 'react-redux';
import { ChevronLeft,ChevronRight } from 'lucide-react';
import { MOCK_RESOURCES } from './MockData';
import { toast } from 'react-toastify';

function SearchBar({ onSortToggle, darkMode,searchTerm,onSearchTermChange }) {
  return (
   <div className={`${styles.searchBarContainer} ${darkMode ? styles.darkModeSearchBarContainer : ''}`}>
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
        <input type="text" className={styles.searchInput} 
        placeholder="Search" value={searchTerm} onChange={onSearchTermChange}/>
      </div>
    </div>
  );
}

function ResourceManagement() {
  const [resources,_] = useState(MOCK_RESOURCES);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const darkMode = useSelector(state => state.theme.darkMode);
  const [searchTerm,setSearchTerm]=useState('');
  const [currentPage,setCurrentPage]=useState(1); // Default to page 1
  const itemsPerPage = 5; // Number of items to show per page
  const totalPages = Math.ceil(MOCK_RESOURCES.length / itemsPerPage);


  const filteredResources = useMemo(() => {
    if (!searchTerm.trim()) return resources;

    const term = searchTerm.toLowerCase();
    return resources.filter(resource =>
      resource.user.toLowerCase().includes(term) ||
      resource.facilities.toLowerCase().includes(term) ||
      resource.materials.toLowerCase().includes(term)
    );
  }, [resources, searchTerm]);

  const sortedResources = useMemo(() => {
    let sortableItems = [...filteredResources];
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
  }, [filteredResources, sortConfig]);

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

  const onSearchTermChange =(e)=>{
    setSearchTerm(e.target.value);
  }

  const Pagination = ({ totalPages, currentPage, setCurrentPage,darkMode}) => {
  
  const getPaginationGroup = () => {
    let pages = [];
    const threshold = 5; // Show full list if total pages are low

    if (totalPages <= threshold) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Logic for truncation
      if (currentPage <= 5) {
        // Near the start
        pages = [1, 2, 3, 4, 5, '...', totalPages];
      } else if (currentPage > totalPages - 4) {
        // Near the end
        pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        // In the middle
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }
    return pages;
  };

  return (
    <div className={`${styles.paginationContainer} ${darkMode ? styles.darkModePaginationContainer : ''}`}>
      {/* Left Button */}
      <button 
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(prev => prev - 1)}
        className={styles.paginationLeft}
      >
        <ChevronLeft size={24} />
      </button>

      {/* Page Numbers & Ellipses */}
      {getPaginationGroup().map((value, index) => (
        <button
          key={index}
          type="button"
          className={value === currentPage ? styles.activePage : styles.paginationButtonIndexes}
          onClick={() => {
            if(typeof value === 'number') {
              setCurrentPage(value);
            }
            else{
              console.log('Ellipsis clicked - no action');
              toast.info('Please use arrow buttons or page numbers to navigate through pages.', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            }
          }}
        >
          {value}
        </button>
      ))}

      {/* Right Button */}
      <button 
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(prev => prev + 1)}
        className={styles.paginationRight}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

  return (
    <div className={`${styles.resourceManagementDashboard} ${darkMode ? styles.darkModeResourceManagementDashboard : ''}`}>
      <div className={styles.dashboardTitle }>
        <h2>Used Resources</h2>
        <button type="button" className={styles.addLogButton}>
          Add New Log
        </button>
      </div>

      <SearchBar onSortToggle={toggleGlobalDirection} 
      darkMode={darkMode} searchTerm={searchTerm} onSearchTermChange={onSearchTermChange}
      />

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

        {sortedResources.slice((currentPage-1) * itemsPerPage, currentPage * itemsPerPage).map(resource => (
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
        {/* Pagination */}
        <Pagination totalPages={totalPages} currentPage={currentPage} 
        setCurrentPage={setCurrentPage} darkMode={darkMode}/>
    </div>
  );
}

export default ResourceManagement;

