import React from 'react';
import userTableDataPermissions from '../../utils/userTableDataPermissions';
import TextSearchBox from './TextSearchBox';
import DropDownSearchBox from './DropDownSearchBox';

/**
 * The header row of the user table.
 */
const UserTableSearchHeader = React.memo(props => {
  const { darkMode } = props;

  const onFirstNameSearch = text => {
    props.onFirstNameSearch(text);
  };

  const onLastNameSearch = text => {
    props.onLastNameSearch(text);
  };

  const onTitleSearch = text => {
    props.onTitleSearch(text);
  };

  const onRoleSearch = text => {
    props.onRoleSearch(text);
  };

  const onEmailSearch = text => {
    props.onEmailSearch(text);
  };

  const onWeeklyHrsSearch = text => {
    props.onWeeklyHrsSearch(text);
  };

  return (
    <tr className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
      <td id="user_active" />
      <td id="user_first">
        <TextSearchBox
          id="firts_name_search"
          searchCallback={onFirstNameSearch}
          placeholder=" Search First Name"
        />
      </td>
      <td id="user_last_name">
        <TextSearchBox
          id="last_name_search"
          searchCallback={onLastNameSearch}
          placeholder=" Search Last Name"
        />
      </td>
      <td id="user_role">
        <DropDownSearchBox id="role_search" items={props.roles} searchCallback={onRoleSearch} />
      </td>
      <td id="user_email">
        <TextSearchBox
          id="email_search"
          searchCallback={onEmailSearch}
          style={{ width: '100%' }}
          placeholder=" Search Email"
        />
      </td>
      <td id="user_hrs" style={{ display: 'flex' }}>
        <TextSearchBox
          id="hrs_search"
          style={{ maxWidth: '75px', margin: '0 auto' }}
          searchCallback={onWeeklyHrsSearch}
        />
      </td>
      <td id="user_title">
        <TextSearchBox
          id="user_title_search"
          searchCallback={onTitleSearch}
          placeholder=" Search Title"
        />
      </td>
      <td id="user_pause" />
      <td id="user_requested_time_off" />
      <td id="user_finalDay" />
      <td id="user_resume_date" />
      <td id="user_start_date" />
      <td id="user_end_date" />
      {userTableDataPermissions(props.authRole, props.roleSearchText) && <td id="user__delete" />}
    </tr>
  );
});

export default UserTableSearchHeader;
