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

  return (
    <tr className={darkMode ? 'bg-yinmn-blue text-light' : ''}
        style={{fontSize: isMobile ? mobileFontSize : 'initial'}}
    >
      <td id="user_active" />
      <td id="user_first">
        <TextSearchBox
          id="firts_name_search"
          searchCallback={onFirstNameSearch}
          placeholder=" Search First Name"
          style={{fontSize: isMobile ? mobileFontSize : 'initial'}}
          className={darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}
        />
      </td>
      <td id="user_last_name">
        <TextSearchBox
          id="last_name_search"
          searchCallback={onLastNameSearch}
          placeholder=" Search Last Name"
          style={{fontSize: isMobile ? mobileFontSize : 'initial'}}
          className={darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}
        />
      </td>
      <td className={styles.userRoleCol}>
        <DropDownSearchBox width= "100px" className={darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''} id="role_search" items={props.roles} searchCallback={onRoleSearch} style={{fontSize: isMobile ? mobileFontSize : 'initial'}}/>
      </td>
      <td className={styles.titleClamp}>
        <div>
          <TextSearchBox
            id="title_search"
            searchCallback={onTitleSearch}
            className={darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}
            style={{ width: '100%' }}
            placeholder=" Search Title"
          />
        </div>
      </td>
      <td id="user_email">
        <TextSearchBox
          id="email_search"
          searchCallback={onEmailSearch}
          style={{ width: isMobile ? mobileWidth : '100%' }}
          placeholder=" Search Email"
          className={darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}
        />
      </td>
      <td id="user_hrs" style={{ display: 'flex' }}>
        <TextSearchBox
          id="hrs_search"
          style={{ maxWidth: '75px', margin: '0 auto', width: isMobile ? mobileWidth : 'initial' }}
          searchCallback={onWeeklyHrsSearch}
          className={darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}
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
