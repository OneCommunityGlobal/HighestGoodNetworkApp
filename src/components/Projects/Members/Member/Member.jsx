/*********************************************************************************
 * Component: MEMBER
 * Author: Henry Ng - 02/03/20
 * Display member of the members list
 ********************************************************************************/
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { assignProject } from './../../../../actions/projectMembers';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';
import PropTypes from 'prop-types'; 
import { permissions } from 'utils/constants';


const Member = props => {
  const canUnassignUserInProject = props.hasPermission(permissions.projects.unassignUserInProject);
  const canGetUserProfiles = props.hasPermission(permissions.userManagement.getUserProfiles);

 
  return (
    <React.Fragment>
      <tr className="members__tr">
        <th scope="row">
          <div>{typeof props.index === 'number' ? props.index + 1 : null}</div>
        </th>
        <td className="members__name">
          {canGetUserProfiles ? (
            <a href={`/userprofile/${props.uid}`}>{props.fullName}</a>
          ) : (
            props.fullName
          )}
        </td>
        {canUnassignUserInProject ? (
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
              style={boxStyle}
            >
              <i className="fa fa-minus" aria-hidden="true"></i>
            </button>
          </td>
        ) : null}
      </tr>
    </React.Fragment>
  );
};

// Define default props
Member.defaultProps = {
  index: 0
};

// Define prop types
Member.propTypes = {
  index: PropTypes.number.isRequired
};

const mapStateToProps = state => {
  return { state };
};
export default connect(mapStateToProps, { assignProject, hasPermission })(Member);
