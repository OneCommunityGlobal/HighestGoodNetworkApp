import React from 'react';
import { useState } from 'react';
import { Dropdown, Input } from 'reactstrap';
import { useSelector } from 'react-redux';

const AssignTeamField = React.memo(props => {
  const [isOpen, toggle] = React.useState(false);
  const [searchText,setSearchText]=useState(()=>{
    if(props.editMode){
      return (props.value==undefined?"":props.value.teamName)
    }else{
      return props.searchText
    }
  })
 
  const darkMode = useSelector(state => state.theme.darkMode);
 
  React.useEffect(() => {
    if (props.selectedTeam && props.selectedTeam.teamName !== searchText) {
      props.onSelectTeam(undefined);
      props.undoTeamAssigned();
    }

    if (searchText === '') {
      props.cleanTeamAssigned();
    }
  }, [searchText]);

  const sTeam = props.teamsData.allTeams.find(team => team.teamName === '2021 Test new');
  if (sTeam) {
    // console.log('sTeam', sTeam);
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
        type="text"
        value={searchText}
        autoFocus={true}
        onChange={e => {
          setSearchText(e.target.value);
          toggle(true);
        }}
      />

      {searchText !== '' && props.teamsData && props.teamsData.allTeams.length > 0 ? (
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
            .filter(team => {
              if (team.teamName.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
                return team;
              }
            })
            .slice(0, 10)
            .map((item,index) => (
              <div
                key={index}
                className="team-auto-complete"
                onClick={() => {
                  setSearchText(item.teamName);
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
