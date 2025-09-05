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
    // Scroll to results when search button is clicked
    setTimeout(() => {
      // Try to find the table data container (where results are shown)
      let resultsContainer = document.querySelector('.table-data-container');
      
      // If table data container is not visible, scroll to the report container data
      if (!resultsContainer || resultsContainer.offsetHeight === 0) {
        resultsContainer = document.querySelector('.report-container-data');
      }
      
      if (resultsContainer) {
        // Scroll to the top of the results table to show item 1
        resultsContainer.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      } else {
        // Fallback: scroll to the category container
        const categoryContainer = document.querySelector('.category-container');
        if (categoryContainer) {
          categoryContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }
    }, 100);

    // Call the parent's search click handler if provided
    if (onSearchClick) {
      onSearchClick();
    }
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
