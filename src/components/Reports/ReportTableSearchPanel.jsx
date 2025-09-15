import React from 'react';
import { useSelector } from 'react-redux';
import { SEARCH } from '../../languages/en/ui';
import './reportsPage.css';

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
      let resultsContainer = document.querySelector('.table-data-container');
      
      // If table data container is not visible, scroll to the report container data
      if (!resultsContainer || resultsContainer.offsetHeight === 0) {
        resultsContainer = document.querySelector('.report-container-data');
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
        const categoryContainer = document.querySelector('.category-container');
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
    <div>
      <div className="input-group" id="new_team">
        <div className="input-group-prepend">
          <button
            type="button"
            className={`btn ${darkMode ? 'bg-yinmn-blue text-light' : 'btn-secondary'}`}
            onClick={handleSearchClick}
          >
            {SEARCH}
          </button>
        </div>

        <input
          /* eslint-disable-next-line jsx-a11y/no-autofocus */
          autoFocus
          type="text"
          className={`form-control search-field-container ${darkMode ? 'bg-darkmode-liblack text-light' : ''}`}
          aria-label="Search"
          placeholder="Search Text"
          id="team-profiles-wild-card-search"
          value={wildCardSearchText}
          onChange={e => {
            onSearch(e.target.value); // Use destructured onSearch directly
          }}
        />
      </div>
    </div>
  );
}

export default ReportTableSearchPanel;
