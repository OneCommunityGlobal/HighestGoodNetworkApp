import React from 'react';
import userTableDataPermissions from '../../utils/userTableDataPermissions';
import TextSearchBox from './TextSearchBox';
import styles from './usermanagement.module.css';
import DropDownSearchBox from './DropDownSearchBox';

/**
 * The header row of the user table.
 */
const UserTableSearchHeader = React.memo(function UserTableSeacrhHeader(props) {
  const { darkMode, isMobile, mobileFontSize, mobileWidth } = props;

  const onFirstNameSearch = text => {
    props.onFirstNameSearch(text);
  };

  const onLastNameSearch = text => {
    props.onLastNameSearch(text);
  };

  const onRoleSearch = text => {
    props.onRoleSearch(text);
  };

  const onTitleSearch = text => {
    props.onTitleSearch(text);
  };

  const onEmailSearch = text => {
    props.onEmailSearch(text);
  };

  const onWeeklyHrsSearch = text => {
    props.onWeeklyHrsSearch(text);
  };

  const darkTd = darkMode ? { backgroundColor: '#3a506b', color: '#ffffff' } : {};
  const darkInput = darkMode ? 'bg-darkmode-liblack border-0 text-light' : '';

  return (
    <tr
      className={darkMode ? 'bg-yinmn-blue text-light' : ''}
      style={{ fontSize: isMobile ? mobileFontSize : 'initial' }}
    >
      <td id="user_active" style={darkTd} />
      <td id="user_first" style={darkTd}>
        <TextSearchBox
          id="firts_name_search"
          searchCallback={onFirstNameSearch}
          placeholder=" Search First Name"
          style={{ fontSize: isMobile ? mobileFontSize : 'initial' }}
          className={darkInput}
        />
      </td>
      <td id="user_last_name" style={darkTd}>
        <TextSearchBox
          id="last_name_search"
          searchCallback={onLastNameSearch}
          placeholder=" Search Last Name"
          style={{ fontSize: isMobile ? mobileFontSize : 'initial' }}
          className={darkInput}
        />
      </td>
      <td className={styles.userRoleCol} style={darkTd}>
        <DropDownSearchBox
          width="100px"
          className={darkInput}
          id="role_search"
          items={props.roles}
          searchCallback={onRoleSearch}
          style={{ fontSize: isMobile ? mobileFontSize : 'initial' }}
        />
      </td>
      <td className={styles.titleClamp} style={darkTd}>
        <div>
          <TextSearchBox
            id="title_search"
            searchCallback={onTitleSearch}
            className={darkInput}
            style={{ width: '100%' }}
            placeholder=" Search Title"
          />
        </div>
      </td>
      <td id="user_email" style={darkTd}>
        <TextSearchBox
          id="email_search"
          searchCallback={onEmailSearch}
          style={{ width: isMobile ? mobileWidth : '100%' }}
          placeholder=" Search Email"
          className={darkInput}
        />
      </td>
      <td id="user_hrs" style={{ display: 'flex', ...darkTd }}>
        <TextSearchBox
          id="hrs_search"
          style={{ maxWidth: '75px', margin: '0 auto', width: isMobile ? mobileWidth : 'initial' }}
          searchCallback={onWeeklyHrsSearch}
          className={darkInput}
        />
      </td>
      <td id="user_pause" style={darkTd} />
      <td id="user_requested_time_off" style={darkTd} />
      <td id="user_finalDay" style={darkTd} />
      <td id="user_resume_date" style={darkTd} />
      <td id="user_start_date" style={darkTd} />
      <td id="user_end_date" style={darkTd} />
      {userTableDataPermissions(props.authRole, props.roleSearchText) && (
        <td id="user__delete" style={darkTd} />
      )}
    </tr>
  );
});

export default UserTableSearchHeader;
