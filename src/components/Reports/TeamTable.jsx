// eslint-disable-next-line no-unused-vars
import { React, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TeamTable.css';
import { Input, FormGroup, FormFeedback } from 'reactstrap';
import { connect } from 'react-redux';
import hasPermission from '~/utils/permissions';
import { updateTeam, getAllUserTeams } from '~/actions/allTeamsAction';
import { updateSavedFiltersForIndividualTeamCodeChange } from '~/actions/savedFilterActions';
import {
  useUpdateFiltersWithIndividualCodesChangeMutation
} from '~/actions/weeklySummariesFilterAction';
import { boxStyle, boxStyleDark } from '~/styles';

function TeamTable({ allTeams, auth, darkMode, refreshTeams }) {
  // Display project lists
  let TeamsList = [];
  const canEditTeamCode = hasPermission('editTeamCode') || auth.user.role === 'Owner';

  // Refresh team data when component mounts
  useEffect(() => {
    refreshTeams();
  }, [refreshTeams]);

  // eslint-disable-next-line react/no-unstable-nested-components
  function EditTeamCode({ team }) {
    const [teamCode, setTeamCode] = useState(team.teamCode);
    const [hasError, setHasError] = useState(false);
    const fullCodeRegex = /^.{5,7}$/;
    const [
        updateFilterWithIndividualCodesChange,
      ] = useUpdateFiltersWithIndividualCodesChangeMutation();

    const handleOnChange = async (value, teamData) => {
      try {
        const result = await updateTeam(teamData.teamName, teamData._id, teamData.isActive, value);
        if (result && result.status === 200) {
          // Update saved filters when team code changes
          if (teamData.teamCode && value && teamData.teamCode !== value) {
            const res = await updateFilterWithIndividualCodesChange({
              oldTeamCode: teamData.teamCode,
              newTeamCode,
              userId: teamData._id,
            }).unwrap(); // unwrap = throw exception if error

            // updateSavedFiltersForIndividualTeamCodeChange(teamData.teamCode, value, teamData._id);
          }
          // Refresh team data to ensure UI shows latest data
          setTimeout(() => {
            refreshTeams();
          }, 500);
        } else {
          // Revert the input if the update failed
          setTeamCode(teamData.teamCode);
        }
      } catch (error) {
        // Revert the input if there was an error
        setTeamCode(teamData.teamCode);
      }
    };

    const handleCodeChange = async e => {
      const { value } = e.target;

      const regexTest = fullCodeRegex.test(value);
      if (regexTest) {
        setHasError(false);
        setTeamCode(value);
        await handleOnChange(value, team);
      } else {
        setTeamCode(value);
        setHasError(true);
      }
    };

    return (
      <div className="team-code-form-field">
        {canEditTeamCode ? (
          <div style={{ paddingRight: '5px' }}>
            <FormGroup>
              <Input
                id="codeInput"
                value={teamCode}
                onChange={e => {
                  if (e.target.value !== teamCode) {
                    handleCodeChange(e);
                  }
                }}
                placeholder="X-XXX"
                invalid={hasError}
                className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
              />
              <FormFeedback>
                NOT SAVED! The code must be between 5 and 7 characters long
              </FormFeedback>
            </FormGroup>
          </div>
        ) : (
          `${teamCode === '' ? 'No assigned code!' : teamCode}`
        )}
      </div>
    );
  }

  if (allTeams.length > 0) {
    TeamsList = allTeams.map((team, index) => (
      <tr id={`tr_${team._id}`} key={team._id}>
        <th scope="row">
          <div className={darkMode ? 'text-light' : ''}>{index + 1}</div>
        </th>
        <td>
          <Link to={`/teamreport/${team._id}`} className={darkMode ? 'text-light' : ''}>
            {team.teamName}
          </Link>
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
          <th style={{ width: '30%' }} scope="col">
            Team Code
          </th>
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
  updateTeam: (teamName, teamId, isActive, teamCode) =>
    dispatch(updateTeam(teamName, teamId, isActive, teamCode)),
  updateSavedFiltersForIndividualTeamCodeChange: (oldTeamCode, newTeamCode, userId) =>
    dispatch(updateSavedFiltersForIndividualTeamCodeChange(oldTeamCode, newTeamCode, userId)),
  refreshTeams: () => dispatch(getAllUserTeams()),
});

export default connect(mapStateToProps, mapDispatchToProps)(TeamTable);
