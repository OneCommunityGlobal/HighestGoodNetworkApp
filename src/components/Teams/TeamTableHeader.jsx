import React from 'react';
import { TEAM_NAME, ACTIVE, MEMBERS } from '../../languages/en/ui';
import hasPermission from 'utils/permissions';
import { connect } from 'react-redux';
import { permissions } from 'utils/constants';

/**
 * The header row of the team table.
 */
export const TeamTableHeader = React.memo(
  ({ onTeamNameSort, onTeamActiveSort, sortTeamNameState, sortTeamActiveState, ...props }) => {
    const canDeleteTeam = props.hasPermission(permissions.teams.deleteTeam);
    const canPutTeam = props.hasPermission(permissions.teams.putTeam);

    const getSortIcon = (sortState) => {
      switch(sortState) {
        case 'ascending': return '↑';
        case 'descending': return '↓';
        default: return '⇵'; // Default icon or whatever you prefer
      }
    }

  return (
    <tr>
      <th scope="col" id="teams__order">
        #
      </th>
      <th scope="col">
        {/* Add the sorting button */}
        <button onClick={onTeamNameSort}>
          {getSortIcon(sortTeamNameState)}{TEAM_NAME}
        </button>
      </th>
      <th scope="col" id="teams__active">
        <button onClick={onTeamActiveSort}>
          {getSortIcon(sortTeamActiveState)}{ACTIVE}
        </button>
      </th>
      <th scope="col" id="teams__members">
        {MEMBERS}
      </th>
      {(canDeleteTeam || canPutTeam) && <th scope="col" id="teams__delete"></th>}
    </tr>
  );
});

export default connect(null, { hasPermission })(TeamTableHeader);
