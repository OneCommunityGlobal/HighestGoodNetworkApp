import React from 'react';
import { TEAM_NAME, ACTIVE, MEMBERS } from '../../languages/en/ui';
import hasPermission from 'utils/permissions';
import { connect } from 'react-redux';

/**
 * The header row of the team table.
 */
export const TeamTableHeader = React.memo(
  ({ onTeamNameSort, onTeamActiveSort, sortTeamNameState, sortTeamActiveState, darkMode, ...props }) => {
    const canDeleteTeam = props.hasPermission('deleteTeam');
    const canPutTeam = props.hasPermission('putTeam');

    const getSortIcon = (sortState) => {
      switch(sortState) {
        case 'ascending': return '↑';
        case 'descending': return '↓';
        default: return '⇵'; // Default icon or whatever you prefer
      }
    }

  return (
    <tr className={darkMode ? 'bg-space-cadet text-light' : ''}>
      <th scope="col" id="teams__order">
        #
      </th>
      <th scope="col">
        {/* Add the sorting button */}
        <button onClick={onTeamNameSort} className={darkMode ? 'text-light' : ''}>
          {getSortIcon(sortTeamNameState)}{TEAM_NAME}
        </button>
      </th>
      <th scope="col" id="teams__active">
        <button onClick={onTeamActiveSort} className={darkMode ? 'text-light' : ''}>
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
