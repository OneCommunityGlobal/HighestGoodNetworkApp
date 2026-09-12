/*********************************************************************************
 * Component: MEMBER
 * Author: Henry Ng - 02/03/20
 * Display member of the members list
 ********************************************************************************/
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { assignProject } from './../../../../actions/projectMembers';
import hasPermission from '~/utils/permissions';
import { boxStyle } from '~/styles';
import PropTypes from 'prop-types';


const Member = ({ index = 0, ...props }) => {
  const { darkMode } = props;
  const canGetProjectMembers = hasPermission('getProjectMembers');
  const canUnassignUserInProject = hasPermission('unassignUserInProject');


  return (
    <React.Fragment>
      <tr className={`members__tr ${darkMode ? 'bg-space-cadet' : ''}`}>
        <th scope="row">
          <div>{typeof index === 'number' ? index + 1 : null}</div>
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

// ...existing code...

// Define prop types
Member.propTypes = {
  index: PropTypes.number.isRequired
};

const mapStateToProps = state => {
  return { state };
};
export default connect(mapStateToProps, { assignProject })(Member);
