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
      <th scope="col" id="teams__order" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
        #
      </th>
      <th
        scope="col"
        className={styles.teamNameCol}
        onClick={onTeamNameSort}
        style={{ cursor: 'pointer' }}
      >
        {TEAM_NAME} <span aria-hidden="true">(All | Active | In Active)</span>
        <span aria-hidden="true" style={{ float: 'right' }}>
          {getSortIcon(sortTeamNameState)}
        </span>
      </th>

      <th
        scope="col"
        id="teams__active"
        onClick={onTeamActiveSort}
        style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}
        aria-label="Active"
      >
        {ACTIVE}
        <span aria-hidden="true" style={{ float: 'right' }}>
          {getSortIcon(sortTeamActiveState)}
        </span>
      </th>
      <th scope="col" id="teams__members" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
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
