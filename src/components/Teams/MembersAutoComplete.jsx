import { useState } from 'react';
import { Dropdown, Input } from 'reactstrap';

export function MemberAutoComplete(props) {
  const [isOpen, toggle] = useState(false);

  const validation = props.userProfileData?.userProfiles || props.userProfileData;

  const filterInputAutoComplete = result => {
    return result
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '');
  };

  const filteredUsers = validation
    ?.filter(user => {
      const fullName = user.firstName + user.lastName;
      if (
        user.isActive &&
        // prettier-ignore
        filterInputAutoComplete(fullName).indexOf(filterInputAutoComplete(props.searchText)) > -1
      ) {
        return user;
      }
      return null;
    })
    .slice(0, 10);

  const renderWeeklySummary = () => {
    if (props.searchText !== '' && props.summaries && props.summaries.length > 0) {
      return (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''}`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {props.summaries
            .filter(
              user =>
                user.firstName.toLowerCase().includes(props.searchText.toLowerCase()) ||
                user.lastName.toLowerCase().includes(props.searchText.toLowerCase()),
            )
            .slice(0, 10)
            .map(item => (
              <div
                key={item._id}
                className="user-auto-cpmplete"
                onClick={() => {
                  props.setSearchText(`${item.firstName} ${item.lastName}`);
                  toggle(false);
                  props.onAddUser(item);
                }}
              >
                {`${item.firstName} ${item.lastName}`}
              </div>
            ))}
        </div>
      );
    }
    return null;
  };

  const renderUserProfileData = () => {
    if (props.searchText !== '' && props.userProfileData && validation.length > 0) {
      return (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''}`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {!filteredUsers.length ? (
            <div className="empty-data-message">No matching users are found</div>
          ) : (
            filteredUsers.map(item => (
              <div
                key={item._id}
                className="user-auto-cpmplete"
                onClick={() => {
                  props.setSearchText(`${item.firstName} ${item.lastName}`);
                  toggle(false);
                  props.onAddUser(item);
                }}
              >
                {`${item.firstName} ${item.lastName}`}
              </div>
            ))
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Dropdown
      isOpen={isOpen}
      toggle={() => {
        toggle(!isOpen);
      }}
      style={{ width: '100%', marginRight: '5px' }}
    >
      <Input
        autoFocus
        type="text"
        value={props.searchText}
        data-testid="input-search"
        onChange={e => {
          props.setSearchText(e.target.value);
          toggle(true);
          props.onAddUser(undefined);
        }}
        className={`${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
      />

      {/* {props.searchText !== '' &&
      props.userProfileData &&
      props.userProfileData.userProfiles.length > 0 ? (
        <>
        {console.log('Rendering dropdown')}
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''}`}
          style={ dropdownStyle}
        >
          {props.userProfileData.userProfiles
            .filter(user => {
              if (!user.isActive) {
                return false;
              }
              const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
              return searchWithAccent(fullName, props.searchText);
            })
            .map(item => (
              <div
                className="user-auto-cpmplete"
                key={item._id}
                onClick={() => {
                  props.setSearchText(`${item.firstName} ${item.lastName}`);
                  toggle(false);
                  props.onAddUser(item);
                }}
              >
                {`${item.firstName} ${item.lastName}`}
              </div>
            ))}
        </div>
        </>
      ) : (
        <>{console.log('Not rendering dropdown')}</>
      )} */}
      {props.context === 'WeeklySummary' ? renderWeeklySummary() : renderUserProfileData()}
    </Dropdown>
  );
}

export default MemberAutoComplete;
