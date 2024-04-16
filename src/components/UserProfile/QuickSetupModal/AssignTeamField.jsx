import React from 'react';
import { Dropdown, Input } from 'reactstrap';

const AssignTeamField = React.memo(props => {
  const [isOpen, toggle] = React.useState(false);

//   React.useEffect(() => {
//     if (!props.selectedTeam) props.setSearchText('');
//     else props.setSearchText(props.selectedTeam.teamName);
//   }, [props.selectedTeam, props.setSearchText]);

  React.useEffect(() => {
    if (props.selectedTeam && props.selectedTeam.teamName !== props.searchText) {
      props.onSelectTeam(undefined);
      props.undoTeamAssigned();
    }

    if (props.searchText === '') {
      props.cleanTeamAssigned();
    }
  }, [props.searchText]);

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
          props.setNewTeamName(e.target.value);
          toggle(true);
        }}
      />

      {props.searchText !== '' && props.teamsData && props.teamsData.allTeams.length > 0 ? (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''}`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {props.teamsData.allTeams
            .filter(team => {
              if (team.teamName.toLowerCase().indexOf(props.searchText.toLowerCase()) > -1) {
                return team;
              }
            })
            .slice(0, 10)
            .map(item => (
              <div
                key={item._id}
                className="team-auto-complete"
                key={item._id}
                onClick={() => {
                  props.setSearchText(item.teamName);
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

export default AssignTeamField;
