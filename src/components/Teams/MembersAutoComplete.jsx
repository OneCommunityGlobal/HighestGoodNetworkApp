import React, { useState } from 'react';
import { Dropdown, Input } from 'reactstrap';

export const MemberAutoComplete = props => {
  const [isOpen, toggle] = useState(false);

  const dropdownStyle = {
    marginTop: '0px',
    width: '100%',
    maxHeight: '350px',  // Adjust this value as needed
    overflowY: 'auto'
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
        data-testid='input-search'
        onChange={e => {
          props.setSearchText(e.target.value);
          toggle(true);
          props.onAddUser(undefined);
        }}
      />

      {props.searchText !== '' &&
      props.userProfileData &&
      props.userProfileData.userProfiles.length > 0 ? (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''}`}
          style={ dropdownStyle}
        >
          {props.userProfileData.userProfiles
            .filter(user => {
              if (
                user.isActive &&
                (user.firstName.toLowerCase().includes(props.searchText.toLowerCase()) ||
                user.lastName.toLowerCase().includes(props.searchText.toLowerCase())) &&
                !props.existingMembers.some(member => member._id === user._id)
              ) {
                return true;
              }
              return false;
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
      ) : (
        <></>
      )}
    </Dropdown>
  );
};

export default MemberAutoComplete;
