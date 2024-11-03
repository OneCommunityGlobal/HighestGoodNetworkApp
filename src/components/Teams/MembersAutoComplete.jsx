import { useState } from 'react';
import { Dropdown, Input } from 'reactstrap';

export function MemberAutoComplete(props) {
  const [isOpen, toggle] = useState(false);

  const validation = props.userProfileData?.userProfiles || props.userProfileData;

  const filterInputAutoComplete = (result) => {
    return result.toLowerCase().trim().replace(/\s+/g, '');
  };

  const filteredUsers = validation
    ?.filter((user) => {
      const fullName = user.firstName + user.lastName;
      return (
        user.isActive &&
        filterInputAutoComplete(fullName).includes(filterInputAutoComplete(props.searchText))
      );
    })
    .slice(0, 10);

  let dropdownContent = null;

  if (props.context === 'WeeklySummary') {
    if (props.searchText !== '' && props.summaries && props.summaries.length > 0) {
      dropdownContent = (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''}`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {props.summaries
            .filter((user) => {
              return (
                user.firstName.toLowerCase().includes(props.searchText.toLowerCase()) ||
                user.lastName.toLowerCase().includes(props.searchText.toLowerCase())
              );
            })
            .slice(0, 10)
            .map((item) => (
              <div
                key={item._id}
                className="user-auto-complete"
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
  } else if (props.searchText !== '' && props.userProfileData && validation.length > 0) {
      dropdownContent = (
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
            filteredUsers.map((item) => (
              <div
                key={item._id}
                className="user-auto-complete"
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
        onChange={(e) => {
          props.setSearchText(e.target.value);
          toggle(true);
          props.onAddUser(undefined);
        }}
      />
      {dropdownContent}
    </Dropdown>
  );
}

export default MemberAutoComplete;
