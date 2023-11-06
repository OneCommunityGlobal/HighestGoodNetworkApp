import React, { useState, useEffect } from 'react';
import { Dropdown, Input } from 'reactstrap';
import './TeamsAndProjects.css';

const AddTeamsAutoComplete = React.memo(props => {
  const [searchText, onInputChange] = useState('');
  const [isOpen, toggle] = useState(false);

  useEffect(() => {
    if (!props.selectedTeam) onInputChange('');
    else onInputChange(props.selectedTeam.teamName);
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

      {searchText !== '' && props.teamsData && props.teamsData.allTeams.length > 0 ? (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''}`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {props.teamsData.allTeams
            .filter(team => {
              if (team.teamName.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
                return team;
              }
            })
            .slice(0, 10)
            .map(item => (
              <div
                className="team-auto-complete"
                key={item._id}
                onClick={() => {
                  onInputChange(item.teamName);
                  toggle(false);
                  props.onDropDownSelect(item);
                }}
              >
                {item.teamName}
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
