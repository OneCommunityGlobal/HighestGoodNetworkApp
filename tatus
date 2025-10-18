// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './reportsPage.css';

/**
 * The search panel stateless component for Report grid
 */
function ReportTableSearchPanel({ onSearch, wildCardSearchText, onScrollToResults }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [inputValue, setInputValue] = useState(wildCardSearchText || '');

  useEffect(() => {
    setInputValue(wildCardSearchText || '');
  }, [wildCardSearchText]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSearch = () => {
    onSearch(inputValue);
    if (onScrollToResults) {
      onScrollToResults();
    }
  };

  return (
    <div className="input-group" id="new_team">
      <button
        type="button"
        className={`btn btn-primary input-group-prepend ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}
        onClick={handleSearch}
        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
      >
        Search
      </button>
      <input
        /* eslint-disable-next-line jsx-a11y/no-autofocus */
        autoFocus
        type="text"
        className={`form-control search-field-container ${darkMode ? 'bg-darkmode-liblack text-light' : ''}`}
        aria-label="Search"
        placeholder="Search Text"
        id="team-profiles-wild-card-search"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
      />
    </div>
  );
}

export default ReportTableSearchPanel;
