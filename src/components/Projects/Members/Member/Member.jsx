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


const Member = props => {
  const { darkMode } = props;
  const canGetProjectMembers = props.hasPermission('getProjectMembers');
  const canUnassignUserInProject = props.hasPermission('unassignUserInProject');


  return (
    <React.Fragment>
      <tr className={`members__tr`}>
        <th scope="row">
          <div>{typeof props.index === 'number' ? props.index + 1 : null}</div>
        </th>
        <td className="members__name">
          {canGetProjectMembers ? (
            <a href={`/userprofile/${props.uid}`} className={darkMode ? 'text-azure' : ''}>{props.fullName}</a>
          ) : (
            props.fullName
          )}
        </td>
        <td className="members__unassign">
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
            style={darkMode ? {} : boxStyle}
          >
            <i className="fa fa-minus" aria-hidden="true"></i>
          </button>
        </td>
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
