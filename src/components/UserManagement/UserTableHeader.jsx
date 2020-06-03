import React from 'react'
import { ACTIVE, FIRST_NAME, LAST_NAME, ROLE, EMAIL, WEEKLY_COMMITTED_HRS } from '../../languages/en/ui'

/**
 * The header row of the user table. 
 */
const UserTableHeader = React.memo(() => {

  return (
    <tr>
      <th scope="col" id="usermanagement_active">{ACTIVE}</th>
      <th scope="col" id="usermanagement_first">{FIRST_NAME}</th>
      <th scope="col" id="usermanagement_last_name">{LAST_NAME}</th>
      <th scope="col" id="usermanagement_role">{ROLE}</th>
      <th scope="col" id="usermanagement_email">{EMAIL}</th>
      <th scope="col" id="usermanagement_hrs">{WEEKLY_COMMITTED_HRS}</th>
      <th scope="col" id="usermanagement_delete"></th>
    </tr>
  )
});

export default UserTableHeader;

