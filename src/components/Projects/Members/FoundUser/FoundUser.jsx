/*********************************************************************************
 * Component: FOUND USER
 * Author: Henry Ng - 02/08/20
 * Display users which were found
 ********************************************************************************/
import React from 'react';
import { connect } from 'react-redux';
import { assignProject } from './../../../../actions/projectMembers';
import { boxStyle } from 'styles';

const FoundUser = props => {
  return (
    <React.Fragment>
      <tr className="members__tr">
        <th scope="row">
          <div>{props.index + 1}</div>
        </th>
        <td className="foundUsers__order">
          <a href={`/userprofile/${props.uid}`}>{props.firstName + ' ' + props.lastName}</a>
        </td>
        <td className="foundUsers__email">{props.email}</td>
        <td className="foundUsers__assign">
          {props.assigned ? null : (
            <button
              className="btn btn-outline-primary btn-sm"
              type="button"
              onClick={e =>
                props.assignProject(
                  props.projectId,
                  props.uid,
                  'Assign',
                  props.firstName,
                  props.lastName,
                )
              }
              style={boxStyle}
            >
              <i className="fa fa-plus" aria-hidden="true"></i>
            </button>
          )}
        </td>
      </tr>
    </React.Fragment>
  );
};
const mapStateToProps = state => {
  return { state };
};
export default connect(mapStateToProps, { assignProject })(FoundUser);
