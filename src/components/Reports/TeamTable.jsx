// eslint-disable-next-line no-unused-vars
import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import './TeamTable.css';
import { Input, FormGroup, FormFeedback } from 'reactstrap';

function TeamTable({ allTeams }) {
  // Display project lists
  let TeamsList = [];
  const canEditTeamCode = hasPermission('editTeamCode') || auth.user.role == 'Owner';

  const EditTeamCode = ({team}) => {

    const [teamCode, setTeamCode] = useState(team.teamCode);
    const [hasError, setHasError] = useState(false);
    const fullCodeRegex = /^[A-Z]-[A-Z]{3}$/;

    const handleOnChange = (value, team) => {
      updateTeam(team.teamName, team._id, team.isActive, value);
    };
  
    const handleCodeChange = e => {
      let value = e.target.value;
      if (e.target.value.length == 1) {
        value = e.target.value + "-";
      }
      if (e.target.value == "-") {
        value = "";
      }
      if (e.target.value.length == 2) {
        if(e.target.value.includes("-")) {
          value = e.target.value.replace("-", "");
        } else {
          value = e.target.value.charAt(0) + "-" + e.target.value.charAt(1);
        }
      }
  
      const regexTest = fullCodeRegex.test(value);
      if (regexTest) {
        setHasError(false);
        setTeamCode(value);
        handleOnChange(value, team);
      } else {
        setTeamCode(value);
        setHasError(true);
      }
    };
  
    return (
      <>
        {canEditTeamCode ?
          <div style={{paddingRight: "5px"}}>
            <FormGroup>
              <Input
                id='codeInput'
                value={teamCode}
                onChange={e => {
                  if(e.target.value != teamCode){
                    handleCodeChange(e);
                  }
                }}
                placeholder="X-XXX"
                invalid={hasError}
              />
              <FormFeedback>
                Please enter a code in the format of X-XXX.
              </FormFeedback>
            </FormGroup>
          </div>
        : 
          `${teamCode == ''? "No assigned team code!": teamCode}`
        }
      </>
    )
  };

  if (allTeams.length > 0) {
    TeamsList = allTeams.map((team, index) => (
      <tr id={`tr_${team._id}`} key={team._id}>
        <th scope="row">
          <div>{index + 1}</div>
        </th>
        <td>
          <Link to={`/teamreport/${team._id}`}>{team.teamName}</Link>
        </td>
        <td className="projects__active--input">
          {team.isActive ? (
            <div className="isActive">
              <i className="fa fa-circle" aria-hidden="true" />
            </div>
          ) : (
            <div className="isNotActive">
              <i className="fa fa-circle-o" aria-hidden="true" />
            </div>
          )}
        </td>
        <td>
          <EditTeamCode team={team}/>
        </td>
      </tr>
    ));
  }
  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th scope="col" id="projects__order">
            #
          </th>
          <th scope="col">Team Name</th>
          <th scope="col" id="projects__active">
            Active
          </th>
          <th style={{width: '30%'}} scope="col">Team Code</th>
        </tr>
      </thead>
      <tbody>{TeamsList}</tbody>
    </table>
  );
}

export default TeamTable;
