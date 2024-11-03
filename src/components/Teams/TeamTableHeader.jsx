import React from 'react';
import hasPermission from 'utils/permissions';
import { connect } from 'react-redux';
import { TEAM_NAME, ACTIVE, MEMBERS } from '../../languages/en/ui';

/**
 * The header row of the team table.
 */
export const TeamTableHeader = React.memo(
  ({
    onTeamNameSort,
    onTeamActiveSort,
    sortTeamNameState,
    sortTeamActiveState,
    darkMode,
    ...props
  }) => {
    const canDeleteTeam = props.hasPermission('deleteTeam');
    const canPutTeam = props.hasPermission('putTeam');

    const getSortIcon = (sortState) => {
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
        <th scope="col">
          <button
            type="button"
            onClick={onTeamNameSort}
            className={darkMode ? 'text-light' : ''}
            aria-label="Sort by Team Name"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {getSortIcon(sortTeamNameState)}
            {TEAM_NAME}
          </button>
        </th>
        <th scope="col">
          <button
            type="button"
            onClick={onTeamActiveSort}
            className={darkMode ? 'text-light' : ''}
            aria-label="Sort by Active Status"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {getSortIcon(sortTeamActiveState)}
            {ACTIVE}
          </button>
        </th>
        <th scope="col" id="teams__members">
          {MEMBERS}
        </th>
        {(canDeleteTeam || canPutTeam) && (
          <th scope="col" id="teams__delete" aria-hidden="true" />
        )}
      </tr>
    );
  }
);

export default connect(null, { hasPermission })(TeamTableHeader);
