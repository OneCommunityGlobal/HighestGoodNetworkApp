import React, { useState } from 'react';
import { Dropdown, Input } from 'reactstrap';

const MemberAutoComplete = props => {
  const [isOpen, toggle] = useState(false);

  return (
    <Dropdown
      isOpen={isOpen}
      toggle={() => {
        toggle(!isOpen);
      }}
      style={{ width: '100%', marginRight: '5px' }}
    >
      <Input
        type="text"
        value={props.searchText}
        onChange={e => {
          props.setSearchText(e.target.value);
          toggle(true);
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
          style={{ marginTop: '0px', width: '100%' }}
        >
          {props.userProfileData.userProfiles
            .filter(user => {
              if (
                user.firstName.toLowerCase().indexOf(props.searchText.toLowerCase()) > -1 ||
                user.lastName.toLowerCase().indexOf(props.searchText.toLowerCase()) > -1
              ) {
                return user;
              }
            })
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
      ) : (
        <></>
      )}
    </Dropdown>
  );
};

export default MemberAutoComplete;
