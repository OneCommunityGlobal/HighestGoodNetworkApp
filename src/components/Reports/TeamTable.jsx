import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import './TeamTable.css';
import { Input, FormGroup, FormFeedback } from 'reactstrap';
import { connect } from 'react-redux';
import hasPermission from '~/utils/permissions';
import { updateTeam } from '~/actions/allTeamsAction';
import { boxStyle, boxStyleDark } from '~/styles';

function TeamTable({ allTeams, auth, darkMode }) {
  // Display project lists
  let TeamsList = [];
  const canEditTeamCode = hasPermission('editTeamCode') || auth.user.role === 'Owner';

  // eslint-disable-next-line react/no-unstable-nested-components
  function EditTeamCode({team}) {

    const [teamCode, setTeamCode] = useState(team.teamCode);
    const [hasError, setHasError] = useState(false);
    const fullCodeRegex = /^.{5,7}$/;

    const handleOnChange = (value, teamData) => {
      updateTeam(teamData.teamName, teamData._id, teamData.isActive, value);
    };
  
    const handleCodeChange = e => {
      const {value} = e.target;
  
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
      <div className='team-code-form-field'>
        {canEditTeamCode ? (
          <div style={{paddingRight: "5px"}}>
            <FormGroup>
              <Input
                id='codeInput'
                value={teamCode}
                onChange={e => {
                  if(e.target.value !== teamCode){
                    handleCodeChange(e);
                  }
                }}
                placeholder="X-XXX"
                invalid={hasError}
                className={darkMode ? "bg-darkmode-liblack text-light border-0" : ''}
              />
              <FormFeedback>
                NOT SAVED! The code must be between 5 and 7 characters long
              </FormFeedback>
            </FormGroup>
          </div>
        )
        : 
          `${teamCode === ''? "No assigned code!": teamCode}`}
      </div>
    )
  }

  if (allTeams.length > 0) {
    TeamsList = allTeams.map((team, index) => (
      <tr id={`tr_${team._id}`} key={team._id}>
        <th scope="row">
          <div className={darkMode ? 'text-light' : ''}>{index + 1}</div>
        </th>
        <td>
          <Link to={`/teamreport/${team._id}`} className={darkMode ? 'text-light' : ''}>{team.teamName}</Link>
        </td>
        <td className="projects__active--input">
          {team.isActive ? (
            <div className="isActive" data-testid="team-is-active">
              <i className="fa fa-circle" aria-hidden="true" />
            </div>
          ) : (
            <div className="isNotActive" data-testid="team-is-inactive">
              <i className="fa fa-circle-o" aria-hidden="true" />
            </div>
          )}
        </td>
        <td>
          <EditTeamCode team={team} />
        </td>
      </tr>
    ));
  }
  return (
    <table 
      className={`table ${darkMode ? 'bg-yinmn-blue' : 'table-bordered'}`}
      style={darkMode ? boxStyleDark : boxStyle}
    >
      <thead>
        <tr className={darkMode ? 'bg-space-cadet text-light' : ''}>
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
      <tbody className={darkMode ? 'dark-mode' : ''}>{TeamsList}</tbody>
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
