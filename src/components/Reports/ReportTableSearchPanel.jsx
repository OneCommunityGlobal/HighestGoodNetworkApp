import React from 'react';
import { SEARCH } from '../../languages/en/ui';

/**
 * The search panel stateless component for  Rreport grid
 */
const ReportTableSearchPanel = (props) => {
  return (
    <div className="input-group" id="new_team">
      <div className="input-group-prepend" style={{ marginLeft: '10px' }}>
        <span className="input-group-text">{SEARCH}</span>
      </div>

      <input
        type="text"
        className="form-control"
        aria-label="Search"
        placeholder="Search Text"
        id="team-profiles-wild-card-search"
        onChange={(e) => {
          props.onSearch(e.target.value);
        }}
      />
    </div>
  );
};

export default ReportTableSearchPanel;
