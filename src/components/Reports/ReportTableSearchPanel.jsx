import React from 'react';
import { SEARCH } from '../../languages/en/ui';
import './reportsPage.css';

/**
 * The search panel stateless component for  Rreport grid
 */
function ReportTableSearchPanel(props) {
  return (
    <div className="input-group" id="new_team">
      <div className="input-group-prepend">
        <span className="input-group-text">{SEARCH}</span>
      </div>

      <input
        autoFocus
        type="text"
        className="form-control search-field-container"
        aria-label="Search"
        placeholder="Search Text"
        id="team-profiles-wild-card-search"
        onChange={e => {
          props.onSearch(e.target.value);
        }}
      />
    </div>
  );
}

export default ReportTableSearchPanel;
