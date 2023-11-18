import React from 'react';
import { TEAM_NAME, ACTIVE, MEMBERS } from '../../languages/en/ui';
import hasPermission from 'utils/permissions';
import { connect } from 'react-redux';

/**
 * The header row of the team table.
 */
export const TeamTableHeader = React.memo(props => {
  //const canDeleteTeam = props.hasPermission('deleteTeam');
  //const canPutTeam = props.hasPermission('putTeam');
  const canEditOrDeleteTeams = props.hasPermission('putTeam') || props.hasPermission('deleteTeam');
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
      {(canEditOrDeleteTeams) && <th scope="col" id="teams__delete"></th>}
    </tr>
  );
});

export default connect(null, { hasPermission })(TeamTableHeader);
