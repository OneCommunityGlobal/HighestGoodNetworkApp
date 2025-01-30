import React from 'react';
import { SEARCH, CREATE_NEW_TEAM } from '../../languages/en/ui';
import hasPermission from 'utils/permissions';
import { boxStyle, boxStyleDark } from 'styles';
import { connect } from 'react-redux';

/**
 * The search panel stateless component for  Teams grid
 */
export const TeamTablesearchPanel = props => {
  const {darkMode} = props;
  const canPostTeam = props.hasPermission('postTeam');
  return (
    <div className="input-group" id="new_team">
      {canPostTeam && (
        <button
          type="button"
          className="btn btn-info"
          onClick={e => {
            props.onCreateNewTeamClick();
          }}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          {CREATE_NEW_TEAM}
        </button>
      )}
      <div className="input-group-prepend" style={{ marginLeft: '10px' }}>
        <span className={`input-group-text ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>{SEARCH}</span>
      </div>

      <input
        autoFocus
        type="text"
        className={`form-control ${darkMode ? 'bg-darkmode-liblack text-light' : ''}`}
        aria-label="Search"
        placeholder="Search Text"
        id="team-profiles-wild-card-search"
        onChange={e => {
          props.onSearch(e.target.value);
        }}
      />
    </div>
  );
};

export default connect(null, { hasPermission })(TeamTablesearchPanel);
