import React, { useState, useEffect } from 'react';
import './summarygroup.css';
import { DELETE, EDIT, VIEW_SUMMARY } from '../../languages/en/ui';
import { updateBadge } from 'actions/badgeManagement';

const summaryGroupTableBody = props => {
  const [role, setRole] = useState(false);

  useEffect(() => {
    const roles = props.currentUserRole;
    // console.log('gets here to change role');
    updateinfo();
    if (roles) {
      // if (role != 'Manager' || role !== 'Mentor') setRole(false);
      if (roles === 'Administrator') {
        setRole(true);
      }
      // console.log('this works:', props.currentUserRole);
    }
  }, [props.currentUserRole]);

  // useEffect(() => {
  //   updateinfo();
  // }, [props.summaryReceiver, props.currentUserId]);

  const updateinfo = async () => {
    const id = props.summaryGroupId;
    if (id) {
      await props.updateUserInfo(id);
      // console.log('Timeout complete');
    }
  };

  return (
    <tr className="summarygroup__tr" id={`tr_${props.summaryGroupId}`}>
      <th className="summarygroup__order--input" scope="row">
        <div>{props.index + 1}</div>
      </th>
      <td>{props.name}</td>
      <td
        className="summarygroup__active--input"
        onClick={e => {
          //</tr>hasPermission(props.requestorRole, 'editDeleteTeam', props.roles, props.userPermissions)
          props.onStatusClick(props.name, props.summaryGroupId, props.active);
        }}
      >
        {props.active ? (
          <div className="isActive">
            <i className="fa fa-circle" aria-hidden="true" />
          </div>
        ) : (
          <div className="isNotActive">
            <i className="fa fa-circle-o" aria-hidden="true" />
          </div>
        )}
      </td>
      <td>
        <button
          type="button"
          className="btn btn-outline-info"
          onClick={e => {
            props.onMembersClick(props.summaryGroupId, props.name);
            props.onDisplaySummaryTable('false');
          }}
        >
          <i className="fa fa-users" aria-hidden="true" />
        </button>
      </td>
      <td>
        <button
          type="button"
          className="btn btn-outline-info"
          onClick={e => {
            props.onSummaryReciverClick(props.summaryGroupId, props.name);
            props.onDisplaySummaryTable('false');
          }}
        >
          <i className="fa fa-users" aria-hidden="true" />
        </button>
      </td>
      <td>
        <span className="usermanagement-actions-cell">
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => {
              props.onEditTeam(props.name, props.summaryGroupId, props.active);
              props.onDisplaySummaryTable('false');
            }}
          >
            {EDIT}
          </button>
        </span>
        <span className="usermanagement-actions-cell">
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => {
              props.onDeleteClick(props.name, props.summaryGroupId, props.active);
              props.onDisplaySummaryTable('false');
            }}
          >
            {DELETE}
          </button>
        </span>
        <span className="usermanagement-actions-cell">
          {role && (
            <button
              type="button"
              className="btn btn-outline-success"
              onClick={() => {
                props.onClickViewReports(props.summaryGroupId);
                props.onDisplaySummaryTable('true');
              }}
            >
              {VIEW_SUMMARY}
            </button>
          )}
        </span>
      </td>
    </tr>
  );
};
export default summaryGroupTableBody;
