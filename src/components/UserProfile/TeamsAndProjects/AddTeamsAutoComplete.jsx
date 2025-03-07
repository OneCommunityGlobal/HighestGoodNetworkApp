import React from 'react';
import { Dropdown, Input } from 'reactstrap';
import './TeamsAndProjects.css';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const AddTeamsAutoComplete = React.memo(props => {
  const [isOpen, toggle] = React.useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

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
        autoFocus={true}
        onChange={e => {
          props.setSearchText(e.target.value);
          toggle(true);
        }}
        className={darkMode ? "bg-darkmode-liblack border-0 text-light" : ""}
      />

      {props.searchText !== '' && props.teamsData ? (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''} ${
            darkMode ? 'bg-darkmode-liblack text-light' : ''
          }`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {props.teamsData.allTeams
            ? props.teamsData.allTeams
                .filter(team => {
                  if (team.teamName.toLowerCase().indexOf(props.searchText.toLowerCase()) > -1)
                    return team;
                  else return;
                })
                .slice(0, 10)
                .map(item => (
                  <div
                    key={item._id}
                    className="team-auto-complete"
                    onClick={() => {
                      props.setSearchText(item.teamName);
                      props.setInputs(inputs => ({
                        ...inputs,
                        teamId: item._id,
                      }))
                      toggle(false);
                    }}
                  >
                    {item.teamName}
                  </div>
                ))
            : toast.error('No teams found')}

          {props.teamsData.allTeams ? (
            props.teamsData.allTeams.every(
              team => team.teamName.toLowerCase() !== props.searchText.toLowerCase(),
            ) && (
              <div
                className="team-auto-complete"
                onClick={() => {
                  toggle(false);
                  props.onCreateNewTeam(props.searchText);
                }}
              >
                Create new team: {props.searchText}
              </div>
            )
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
    </Dropdown>
  );
});

export default AddTeamsAutoComplete;