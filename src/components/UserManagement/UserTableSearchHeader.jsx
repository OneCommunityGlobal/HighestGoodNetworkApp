import React from 'react';
import TextSearchBox from './TextSearchBox';
import DropDownSearchBox from './DropDownSearchBox';

/**
 * The header row of the user table.
 */
const UserTableSearchHeader = React.memo((props) => {
  const onFirstNameSearch = (text) => {
    props.onFirstNameSearch(text);
  };

  const onLastNameSearch = (text) => {
    props.onLastNameSearch(text);
  };

  const onRoleSearch = (text) => {
    props.onRoleSearch(text);
  };

  const onEmailSearch = (text) => {
    props.onEmailSearch(text);
  };

  const onWeeklyHrsSearch = (text) => {
    props.onWeeklyHrsSearch(text);
  };

  return (
    <tr>
      <td id="user_active"></td>
      <td id="user_first">
        <TextSearchBox id={'firts_name_search'} searchCallback={onFirstNameSearch} />
      </td>
      <td id="user_last_name">
        <TextSearchBox id={'last_name_search'} searchCallback={onLastNameSearch} />
      </td>
      <td id="user_role">
        <DropDownSearchBox id={'role_search'} items={props.roles} searchCallback={onRoleSearch} />
      </td>
      <td id="user_email">
        <TextSearchBox id={'email_search'} searchCallback={onEmailSearch} />
      </td>
      <td id="user_hrs">
        <TextSearchBox
          id={'hrs_search'}
          style={{ maxWidth: '75px' }}
          searchCallback={onWeeklyHrsSearch}
        />
      </td>
      <td id="user_pause"></td>
      <td id="user_resume_date"></td>
      <td id="user_end_date"></td>
      <td id="user__delete"></td>
    </tr>
  );
});

export default UserTableSearchHeader;
