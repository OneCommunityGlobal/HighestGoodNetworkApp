import React, { useState } from 'react';
import { Dropdown, Input } from 'reactstrap';
import { searchWithAccent } from 'utils/search'
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
      )}
    </Dropdown>
  );
};

export default MemberAutoComplete;
