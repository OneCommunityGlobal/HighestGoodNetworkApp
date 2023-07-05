import React from 'react';
import { TEAM_NAME, ACTIVE, MEMBERS } from '../../languages/en/ui';
import hasPermission from 'utils/permissions';

/**
 * The header row of the team table.
 */
const TeamTableHeader = React.memo(props => {
  const canDeleteTeam = hasPermission('deleteTeam');
  const canPutTeam = hasPermission('putTeam');
  return (
    <tr>
      <th scope="col" id="teams__order">
        #
      </th>
      <th scope="col">{TEAM_NAME}</th>
      <th scope="col" id="teams__active">
        {ACTIVE}
      </th>
      <th scope="col" id="teams__members">
        {MEMBERS}
      </th>
      {(canDeleteTeam || canPutTeam) && <th scope="col" id="teams__delete"></th>}
    </tr>
  );
});

export default TeamTableHeader;
