/*********************************************************************************
 * Component: FOUND USER
 * Author: Henry Ng - 02/08/20
 * Display users which were found
 ********************************************************************************/
import React from 'react';
import { connect } from 'react-redux';
import { assignProject } from './../../../../actions/projectMembers';
import { boxStyle } from '~/styles';

const FoundUser = props => {
  const {darkMode} = props;
  return (
    <React.Fragment>
      <tr className={`members__tr ${darkMode ? 'bg-yinmn-blue' : ''}`}>
        <th scope="row">
          <div>{props.index + 1}</div>
        </th>
        <td className="foundUsers__order">
          {props.fullName}
        </td>
        <td className="foundUsers__email">
          {props.email}
        </td>
        <td className="foundUsers__assign">
          {props.assigned ? (
            <span className="text-success">Assigned</span>
          ) : (
            <button
              className="btn btn-outline-primary btn-sm"
              type="button"
              style={darkMode ? {} : boxStyle}
              disabled
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
