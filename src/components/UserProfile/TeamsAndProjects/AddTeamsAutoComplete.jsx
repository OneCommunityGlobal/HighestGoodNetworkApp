import React from 'react';
import { Dropdown, Input } from 'reactstrap';
import './TeamsAndProjects.css';
import { useSelector } from 'react-redux';

const AddTeamsAutoComplete = React.memo(props => {
  const [isOpen, toggle] = React.useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  const filteredTeams =
    props.teamsData?.allTeams?.filter(team =>
      team.teamName.toLowerCase().includes(props.searchText.toLowerCase()),
    ) || [];

  const noExactMatch =
    filteredTeams.length === 0 ||
    filteredTeams.every(team => team.teamName.toLowerCase() !== props.searchText.toLowerCase());

  const showDropdown = props.searchText !== '' && props.teamsData && props.teamsData.allTeams;

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
        autoFocus
        onChange={e => {
          props.setSearchText(e.target.value);
          toggle(true);
        }}
        className={darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}
      />

      {showDropdown && (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''} ${
            darkMode ? 'bg-darkmode-liblack text-light' : ''
          }`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {filteredTeams.length > 0 && (
            <>
              {filteredTeams.slice(0, 10).map(item => (
                <div
                  key={item._id}
                  className="team-auto-complete"
                  onClick={() => {
                    props.setSearchText(item.teamName);
                    props.setInputs(inputs => ({
                      ...inputs,
                      teamId: item._id,
                    }));
                    toggle(false);
                  }}
                >
                  {item.teamName}
                </div>
              ))}
            </>
          )}

          {/* Always show "Create new team" if no exact match */}
          {noExactMatch && (
            <div
              className="team-auto-complete"
              onClick={() => {
                toggle(false);
                props.onCreateNewTeam(props.searchText);
              }}
            >
              Create new team: {props.searchText}
            </div>
          )}
        </div>
      )}
    </Dropdown>
  );
});

export default AddTeamsAutoComplete;
