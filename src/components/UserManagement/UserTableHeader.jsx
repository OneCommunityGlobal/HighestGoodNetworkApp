import React from 'react'
import { ACTIVE, FIRST_NAME, LAST_NAME, ROLE, EMAIL, WEEKLY_COMMITTED_HRS } from '../../languages/en/ui'

/**
 * The header row of the user table. 
 */
const UserTableHeader = React.memo(() => {

  return (
    <tr>
      <th scope="col" id="user_active">{ACTIVE}</th>
      <th scope="col" id="user_first">{FIRST_NAME}</th>
      <th scope="col" id="user_last_name">{LAST_NAME}</th>
      <th scope="col" id="user_role">{ROLE}</th>
      <th scope="col" id="user_email">{EMAIL}</th>
      <th scope="col" id="user_hrs">{WEEKLY_COMMITTED_HRS}</th>
      <th scope="col" id="user__delete"></th>
    </tr>
  )
});

export default UserTableHeader;

