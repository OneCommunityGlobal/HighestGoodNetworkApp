import React from 'react';
import { connect } from 'react-redux';
import hasPermission from '~/utils/permissions';
import { TEAM_NAME, ACTIVE, MEMBERS } from '../../languages/en/ui';

import styles from './TeamTableHeader.module.css';

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
      <th scope="col" className={styles.teamNameCol}>
        <button type="button" onClick={onTeamNameSort} className={darkMode ? 'text-light' : ''}>
          <span aria-hidden="true">{getSortIcon(sortTeamNameState)}</span>
          {TEAM_NAME} <span aria-hidden="true">(All | Active | In Active)</span>
        </button>
      </th>
      <th scope="col" id="teams__active">
        <button
          type="button"
          onClick={onTeamActiveSort}
          className={darkMode ? 'text-light' : ''}
          aria-label="Active"
        >
          <span aria-hidden="true">{getSortIcon(sortTeamActiveState)}</span>
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
