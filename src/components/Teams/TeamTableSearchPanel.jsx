import React from 'react';
import { SEARCH, CREATE_NEW_TEAM } from '../../languages/en/ui';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';
import { permissions } from 'utils/constants';

/**
 * The search panel stateless component for  Teams grid
 */
export const TeamTablesearchPanel = props => {
  const canPostTeam = props.hasPermission(permissions.teams.postTeam);
  return (
    <div className="input-group" id="new_team">
      {canPostTeam && (
        <button
          type="button"
          className="btn btn-info"
          onClick={e => {
            props.onCreateNewTeamClick();
          }}
          style={boxStyle}
        >
          {CREATE_NEW_TEAM}
        </button>
      )}
      <div className="input-group-prepend" style={{ marginLeft: '10px' }}>
        <span className="input-group-text">{SEARCH}</span>
      </div>

      <input
        autoFocus
        type="text"
        className="form-control"
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
