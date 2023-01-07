import React from 'react';
import {
  ACTIVE,
  FIRST_NAME,
  LAST_NAME,
  ROLE,
  EMAIL,
  WKLY_COMMITTED_HRS,
  PAUSE,
  USER_RESUME_DATE,
  MANAGE_FINAL_DAY,
} from '../../languages/en/ui';

/**
 * The header row of the user table.
 */
const UserTableHeader = React.memo(props => {
  return (
    <tr>
      <th scope="col" id="usermanagement_active">
        {ACTIVE}
      </th>
      <th scope="col" id="usermanagement_first">
        {FIRST_NAME}
      </th>
      <th scope="col" id="usermanagement_last_name">
        {LAST_NAME}
      </th>
      <th scope="col" id="usermanagement_role">
        {ROLE}
      </th>
      <th scope="col" id="usermanagement_email">
        {EMAIL}
      </th>
      <th scope="col" id="usermanagement_hrs">
        {WKLY_COMMITTED_HRS}
      </th>
      <th scope="col" id="usermanagement_pause">
        {PAUSE}
      </th>
      <th scope="col" id="usermanagement_finalday">
        {MANAGE_FINAL_DAY}
      </th>
      <th scope="col" id="usermanagement_resume_date">
        {USER_RESUME_DATE}
      </th>
      <th scope="col" id="usermanagement_resume_date">
        End Date
      </th>
      <th scope="col" id="usermanagement_delete"></th>
    </tr>
  );
});

export default UserTableHeader;
