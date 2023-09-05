/*********************************************************************************
 * Component: MEMBER
 * Author: Henry Ng - 02/03/20
 * Display member of the members list
 ********************************************************************************/
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { assignProject } from './../../../../actions/projectMembers';
import hasPermission from 'utils/permissions';

const Member = props => {
  const canGetUserProfiles = props.hasPermission('getUserProfiles');
  const canAssignProjectToUsers = props.hasPermission('assignProjectToUsers');
  return (
    <React.Fragment>
      <tr className="members__tr">
        <th scope="row">
          <div>{props.index + 1}</div>
        </th>
        <td className="members__name">
          {canGetUserProfiles ? (
            <a href={`/userprofile/${props.uid}`}>{props.fullName}</a>
          ) : (
            props.fullName
          )}
        </td>
        {canAssignProjectToUsers ? (
          <td className="members__assign">
            <button
              className="btn btn-outline-danger btn-sm"
              type="button"
              onClick={e =>
                props.assignProject(
                  props.projectId,
                  props.uid,
                  'unAssign',
                  props.firstName,
                  props.lastName,
                )
              }
            >
              <i className="fa fa-minus" aria-hidden="true"></i>
            </button>
          </td>
        ) : null}
      </tr>
    </React.Fragment>
  );
};
const mapStateToProps = state => {
  return { state };
};
export default connect(mapStateToProps, { assignProject, hasPermission })(Member);
