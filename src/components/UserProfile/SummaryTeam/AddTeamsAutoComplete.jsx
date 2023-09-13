import React, { useState, useEffect } from 'react';
import { Dropdown, Input } from 'reactstrap';
import '../TeamsAndProjects/TeamsAndProjects.css';

const AddTeamsAutoComplete = React.memo(props => {
  const [searchText, onInputChange] = useState('');
  const [isOpen, toggle] = useState(false);

  useEffect(() => {
    if (!props.selectedTeam) onInputChange('');
  }, [props.selectedTeam]);

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
        onChange={e => {
          onInputChange(e.target.value);
          toggle(true);
        }}
      />

      {searchText !== '' && props.teamsData && props.teamsData.length > 0 ? (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''}`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {props.teamsData
            .filter(team => {
              if (team.summaryGroupName.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
                return team;
              }
            })
            .slice(0, 10)
            .map(item => (
              <div
                className="team-auto-complete"
                onClick={() => {
                  onInputChange(item.summaryGroupName);
                  toggle(false);
                  props.onDropDownSelect(item);
                }}
              >
                {item.summaryGroupName}
              </div>
            ))}
        </div>
      ) : (
        <></>
      )}
    </Dropdown>
  );
});

export default AddTeamsAutoComplete;
