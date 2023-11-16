// eslint-disable-next-line no-unused-vars
import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import './TeamTable.css';
import { Input, FormGroup, FormFeedback } from 'reactstrap';
import { connect } from 'react-redux';
import hasPermission from 'utils/permissions';
import { updateTeam } from 'actions/allTeamsAction';

function TeamTable({ allTeams, auth, hasPermission }) {
  // Display project lists
  let TeamsList = [];
  const canEditTeamCode = hasPermission('editTeamCode') || auth.user.role == 'Owner';

  const EditTeamCode = ({team}) => {

    const [teamCode, setTeamCode] = useState(team.teamCode);
    const [hasError, setHasError] = useState(false);
    const fullCodeRegex = /^([a-zA-Z]-[a-zA-Z]{3}|[a-zA-Z]{5})$/;

    const handleOnChange = (value, team) => {
      updateTeam(team.teamName, team._id, team.isActive, value);
    };
  
    const handleCodeChange = e => {
      let value = e.target.value;
  
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
              The code format must be A-AAA or AAAAA.
              </FormFeedback>
            </FormGroup>
          </div>
        : 
          `${teamCode == ''? "No assigned code!": teamCode}`
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

const mapStateToProps = state => ({
  auth: state.auth,
});

const mapDispatchToProps = dispatch => ({
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TeamTable);
