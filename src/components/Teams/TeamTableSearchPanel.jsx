import React from 'react';
import { SEARCH, CREATE_NEW_TEAM } from '../../languages/en/ui';
import hasPermission from 'utils/permissions';

/**
 * The search panel stateless component for  Teams grid
 */
const TeamTablesearchPanel = props => {
  return (
    <div className="input-group" id="new_team">
      {hasPermission(props.requestorRole, 'createTeam', props.roles, props.userPermissions) && (
        <button
          type="button"
          className="btn btn-info"
          onClick={e => {
            props.onCreateNewTeamClick();
          }}
        >
          {CREATE_NEW_TEAM}
        </button>
      )}
      <div className="input-group-prepend" style={{ marginLeft: '10px' }}>
        <span className="input-group-text">{SEARCH}</span>
      </div>

      <input
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

export default TeamTablesearchPanel;
