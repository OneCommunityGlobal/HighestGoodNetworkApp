/*********************************************************************************
 * Component: MEMBER
 * Author: Henry Ng - 02/03/20
 * Display member of the members list
 ********************************************************************************/
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { assignProject } from './../../../../actions/projectMembers';
import { UserRole } from './../../../../utils/enums';

const Member = (props) => {
  const [role] = useState(props.state ? props.state.auth.user.role : null);
  return (
    <React.Fragment>
      <tr className="members__tr">
        <th scope="row">
          <div>{props.index + 1}</div>
        </th>
        <td className="members__name">
          <a href={`/userprofile/${props.uid}`}>{props.fullName}</a>
        </td>
        {role === UserRole.Administrator ? (
          <td className="members__assign">
            <button
              className="btn btn-outline-danger btn-sm"
              type="button"
              onClick={(e) =>
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
const mapStateToProps = (state) => {
  return { state };
};
export default connect(mapStateToProps, { assignProject })(Member);
