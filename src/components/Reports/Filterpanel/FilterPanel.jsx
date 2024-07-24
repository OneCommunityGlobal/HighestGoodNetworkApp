import React, { Component } from 'react';
import { boxStyle, boxStyleDark } from 'styles';
import ReportTableSearchPanel from '../ReportTableSearchPanel';

const FilterPanel = ({ setActive, setInActive, setAll, onWildCardSearch, onCreateNewTeamShow }) => {
    return (
      <div>
        <div>
          <a>Select a Filter</a>
        </div>
        <div>
          <input
            name="radio"
            type="radio"
            style={{ margin: '8px 12px', marginLeft: 0 }}
            value="active"
            onChange={setActive}
          />
          Active
          <input
            name="radio"
            type="radio"
            style={{ margin: '8px 12px' }}
            value="inactive"
            onChange={setInActive}
          />
          Inactive
          <input
            name="radio"
            type="radio"
            style={{ margin: '8px 12px' }}
            value="all"
            onChange={setAll}
            defaultChecked
          />
          All
        </div>
        <div className="mt-4">
          <ReportTableSearchPanel onSearch={onWildCardSearch} onCreateNewTeamClick={onCreateNewTeamShow} />
        </div>
      </div>
    );
  };
  
  export default FilterPanel;
