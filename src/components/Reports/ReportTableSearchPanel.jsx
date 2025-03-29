// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useSelector } from 'react-redux';
import { SEARCH } from '../../languages/en/ui';
import './reportsPage.css';

/**
 * The search panel stateless component for Report grid
 */
function ReportTableSearchPanel({ onSearch }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  // Destructure onSearch here
  return (
    <div className="input-group" id="new_team">
      <div className="input-group-prepend">
        <span className={`input-group-text ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>{SEARCH}</span>
      </div>

      <input
        /* eslint-disable-next-line jsx-a11y/no-autofocus */
        autoFocus
        type="text"
        className={`form-control search-field-container ${darkMode ? 'bg-darkmode-liblack text-light' : ''}`}
        aria-label="Search"
        placeholder="Search Text"
        id="team-profiles-wild-card-search"
        onChange={e => {
          onSearch(e.target.value); // Use destructured onSearch directly
        }}
      />
    </div>
  );
}

export default ReportTableSearchPanel;
