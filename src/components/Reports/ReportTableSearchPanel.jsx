import React from 'react';
import { useSelector } from 'react-redux';
import { SEARCH } from '../../languages/en/ui';
import styles from './reportsPage.module.css';

/**
 * The search panel stateless component for Report grid
 */
function ReportTableSearchPanel({ onSearch, wildCardSearchText, onSearchClick }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleSearchClick = () => {
    // Call the parent's search click handler if provided
    if (onSearchClick) {
      onSearchClick();
    }

    // Scroll to results when search button is clicked, but ensure header remains visible
    setTimeout(() => {
      // Try to find the table data container (where results are shown)
      let resultsContainer = document.querySelector(`.${styles['table-data-container']}`);
      
      // If table data container is not visible, scroll to the report container data
      if (!resultsContainer || resultsContainer.offsetHeight === 0) {
        resultsContainer = document.querySelector(`.${styles['report-container-data']}`);
      }
      
      if (resultsContainer) {
        // Get header height to offset the scroll position
        const header = document.querySelector('.header-wrapper, .navbar, [data-testid="header"]');
        const headerHeight = header ? header.offsetHeight : 80; // fallback to 80px
        
        // Add some extra padding to ensure header is clearly visible
        const extraPadding = 30;
        
        // Scroll to results but leave space for the header
        const elementTop = resultsContainer.offsetTop;
        const offsetPosition = elementTop - headerHeight - extraPadding;
        
        window.scrollTo({
          top: Math.max(0, offsetPosition), // Ensure we don't scroll to negative position
          behavior: 'smooth'
        });
      } else {
        // Fallback: scroll to the category container with header offset
        const categoryContainer = document.querySelector(`.${styles['category-container']}`);
        if (categoryContainer) {
          const header = document.querySelector('.header-wrapper, .navbar, [data-testid="header"]');
          const headerHeight = header ? header.offsetHeight : 80;
          const extraPadding = 30;
          const elementTop = categoryContainer.offsetTop;
          const offsetPosition = elementTop - headerHeight - extraPadding;
          
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        }
      }
    }, 100);
  };

  return (
    <div className={`${styles['search-field']} ${darkMode ? styles['search-field-dark'] : ''}`}>
      <button
        type="button"
        className={styles['search-field-icon']}
        onClick={handleSearchClick}
        aria-label={SEARCH}
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="20" y1="20" x2="16.65" y2="16.65" />
        </svg>
      </button>

      <input
        /* eslint-disable-next-line jsx-a11y/no-autofocus */
        autoFocus
        type="text"
        className={`${styles['search-field-input']} ${
          darkMode ? styles['search-field-input-dark'] : ''
        }`}
        aria-label={SEARCH}
        placeholder="Search Text"
        id="team-profiles-wild-card-search"
        value={wildCardSearchText}
        onChange={e => {
          onSearch(e.target.value); // Use destructured onSearch directly
        }}
      />
    </div>
  );
}

export default ReportTableSearchPanel;