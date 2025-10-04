import React from 'react';
import { connect } from 'react-redux';
import hasPermission from '~/utils/permissions';
import { TEAM_NAME, ACTIVE, MEMBERS } from '../../languages/en/ui';

import './TeamsOverview.css';

/**
 * The header row of the team table.
 */
function TeamTableHeaderComponent({
  onTeamNameSort,
  onTeamActiveSort,
  sortTeamNameState,
  sortTeamActiveState,
  darkMode,
  ...props
}) {
  const canDeleteTeam = props.hasPermission('deleteTeam');
  const canPutTeam = props.hasPermission('putTeam');

  const getSortIcon = sortState => {
    switch (sortState) {
      case 'ascending':
        return '↑';
      case 'descending':
        return '↓';
      default:
        return '⇵';
    }
  };

  return (
    <tr className={darkMode ? 'bg-space-cadet text-light' : ''}>
      <th scope="col" id="teams__order">
        #
      </th>
      <th scope="col" className="team-name-col">
        <button type="button" onClick={onTeamNameSort} className={darkMode ? 'text-light' : ''}>
          {getSortIcon(sortTeamNameState)}
          {TEAM_NAME}
        </button>
      </th>
      <th scope="col" id="teams__active">
        <button type="button" onClick={onTeamActiveSort} className={darkMode ? 'text-light' : ''}>
          {getSortIcon(sortTeamActiveState)}
          {ACTIVE}
        </button>
      </th>
      <th scope="col" id="teams__members">
        {MEMBERS}
      </th>
      {(canDeleteTeam || canPutTeam) && (
        <th scope="col" id="teams__delete" data-testid="teams__delete" />
      )}
    </tr>
  );
}

TeamTableHeaderComponent.displayName = 'TeamTableHeader';

export const TeamTableHeader = React.memo(TeamTableHeaderComponent);

export default connect(null, { hasPermission })(TeamTableHeader);
