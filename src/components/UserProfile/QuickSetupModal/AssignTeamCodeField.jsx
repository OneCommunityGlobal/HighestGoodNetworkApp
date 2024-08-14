import React, { useEffect, useState } from 'react';
import { Dropdown, Input } from 'reactstrap';


const AssignTeamCodeField = React.memo(props => {
  const [searchText, onInputChange] = useState('');
  const [isOpen, toggle] = useState(false);
  useEffect(() => {
    if (props.selectedTeamCode && props.selectedTeamCode !== searchText) {
      props.onSelectTeamCode(undefined);
      props.cleanTeamCodeAssign();
    }
  }, [searchText]);

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
        value={searchText}
        autoFocus={true}
        onChange={e => {
          onInputChange(e.target.value);
          toggle(true);
        }}
      />

      {searchText !== '' && props.teamCodeData?.size > 0 ? (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''}`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {[...props.teamCodeData]
                      .filter(teamCode => {
              if (teamCode.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
                return teamCode;
              }
            })
            .slice(0, 10)
            .map(item => (
              <div
                className="project-auto-complete"
                key={item._id}
                onClick={() => {
                  onInputChange(item);
                  toggle(false);
                  props.onDropDownSelect(item);
                }}
              >
                {item}
              </div>
            ))}
              </div>

      ) : null}
    </Dropdown>
  );
});

export default AssignTeamCodeField;
